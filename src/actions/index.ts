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
		handler: async ({ picture, ip, userAgent }, _context) => {
			if (!picture) {
				throw new Error("No image provided");
			}
			const arrayBuffer = await picture.arrayBuffer();
			const imageBuffer = Buffer.from(arrayBuffer);

			const sharpInstance = await sharp(imageBuffer)
				.rotate() // Apply EXIF orientation
				.sharpen({ sigma: 2 });

			const metadata = await sharpInstance.metadata();
			// Crop to centered square, max 576x576
			const maxPrinterWidth = 576;
			const size = Math.min(metadata.width ?? maxPrinterWidth, metadata.height ?? maxPrinterWidth, maxPrinterWidth);
			const targetSize = Math.floor(size / 8) * 8;
			const processedImage = await sharpInstance
				.resize({
					width: targetSize,
					height: targetSize,
					fit: "cover",
					position: "center"
				})
				.toColorspace("b-w")
				.png({ colors: 4 })
				.toBuffer();

			await sharp(processedImage).toFile("./photo.png");

			const image = await loadImage(processedImage);
			const imagemessage = encoder
				.align("center")
				.image(image, targetSize, targetSize, "atkinson")
				.newline(2);
			client.write(imagemessage.cut().encode());
			return;
		},
	}),
};
