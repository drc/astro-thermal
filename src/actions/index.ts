import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { createCanvas, loadImage } from "canvas";
import { client } from "@/lib/printer";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import sharp from "sharp";
import { sharpImageService } from "astro/config";

const DEBUG = process.env.DEBUG || false; // Set to true to enable debug information

const encoder = new ReceiptPrinterEncoder({
	// @ts-ignore
	createCanvas,
	imageMode: "raster",
	feedBeforeCut: 8,
});

export const server = {
	handlePhoto: defineAction({
		accept: "form",
		input: z.object({
			picture: z.instanceof(File).optional(),
			ip: z.string().optional(),
			userAgent: z.string().optional(),
		}),
		handler: async ({picture, ip, userAgent}, _context) => {
			if (!picture) {
				throw new Error("No image provided");
			}
			const arrayBuffer = await picture.arrayBuffer();
			const imageBuffer = Buffer.from(arrayBuffer);

			const sharpInstance = await sharp(imageBuffer)
				.metadata()
				.then(() => sharp(imageBuffer).sharpen({ sigma: 2 }));

			const metadata = await sharpInstance.metadata();

			// Ensure width is a multiple of 8 and does not exceed printer max width
			const maxPrinterWidth = 575;
			const computedWidth = Math.floor((metadata.width ?? 300) / 8) * 8;
			const targetWidth = Math.min(computedWidth, Math.floor(maxPrinterWidth / 8) * 8);
			const targetHeight = metadata.height ?? 300;

			const processedImage = await sharpInstance
				.resize(targetWidth, targetHeight, { fit: "cover" })
				.toColorspace("b-w")
				.png({ colors: 4 })
				.toBuffer();

			await sharp(processedImage).toFile("./photo.png");

			const imagemessage = encoder
				.align("center")
				.image(processedImage, targetWidth, targetHeight, "atkinson")
				.newline(2);
			imagemessage.encode();
			return;
		},
	}),
	printPhoto: defineAction({
		input: z.object({
			imageDataUrl: z.string().includes("data:image/png;base64,"),
			message: z.string().optional(),
			ip_address: z.string().optional(),
			user_agent: z.string().optional(),
		}),
		handler: async (input, _context) => {
			try {
				const imageBuffer = Buffer.from(
					input.imageDataUrl.split(",")[1],
					"base64",
				);
				const sharpInstance = await sharp(imageBuffer)
					.metadata()
					.then(() => sharp(imageBuffer).sharpen({ sigma: 2 }));
				sharpInstance
					.toColorspace("b-w")
					.png({ colors: 4 })
					.toFile("./photo.png");
				const processedBuffer = await sharpInstance.toBuffer();
				const processedBase64 = `data:image/png;base64,${processedBuffer.toString("base64")}`;
				const image = await loadImage(processedBase64);
				const { width, height } = image;
				const imagemessage = encoder
					.align("center")
					.image(image, width, height, "atkinson");
				if (input.message) {
					imagemessage.align("center").text(input.message);
					imagemessage.newline(2);
				}
				if (DEBUG) {
					imagemessage
						.align("center")
						.text(input.ip_address || "No IP Address");
					imagemessage.newline(2);
					imagemessage
						.align("center")
						.text(input.user_agent || "No User Agent");
				}
				client.write(imagemessage.cut().encode());
				return "Photo printed!";
			} catch (e) {
				console.error(e);
			}
		},
	}),
};
