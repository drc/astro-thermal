import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { createCanvas, loadImage } from "canvas";
import { client } from "@/lib/printer";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import sharp from "sharp";
import db from "@/lib/database";
import { pipeline, type ImageToTextOutput } from "@huggingface/transformers";

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
			picture: z.instanceof(File),
			ip: z.string().optional(),
			userAgent: z.string().optional(),
		}),
		handler: async ({ picture, ip, userAgent }, _context) => {
			if (!picture) {
				throw new Error("No image provided");
			}
			const arrayBuffer = await picture.arrayBuffer();
			const imageBuffer = Buffer.from(arrayBuffer);

			const sharpInstance = sharp(imageBuffer)
				.rotate() // Apply EXIF orientation
				.sharpen({ sigma: 2 });

			const metadata = await sharpInstance.metadata();
			// Crop to centered square, max 576x576
			const maxPrinterWidth = 576;
			const size = Math.min(
				metadata.width ?? maxPrinterWidth,
				metadata.height ?? maxPrinterWidth,
				maxPrinterWidth,
			);
			const targetSize = Math.floor(size / 8) * 8;
			const processedImage = await sharpInstance
				.resize({
					width: targetSize,
					height: targetSize,
					fit: "cover",
					position: "center",
				})
				.toColorspace("b-w")
				.png({ colors: 4 })
				.toBuffer();

			db.run("INSERT INTO images (data) VALUES (?)", processedImage);

			await sharp(processedImage).toFile("./photo-bw.png");

			const captioner = await pipeline(
				"image-to-text",
				"Xenova/vit-gpt2-image-captioning",
				{ device: "cpu", dtype: "fp32" },
			);

			// The second parameter are generation/inference options forwarded to the model.
			// Common options (map to transformers' generate() / inference parameters):
			//  - max_length: number        -> maximum output token length
			//  - min_length: number        -> minimum output token length
			//  - do_sample: boolean        -> use sampling (true) or deterministic (false)
			//  - num_beams: number         -> beam search width (higher -> more thorough)
			//  - top_k: number             -> top-k sampling
			//  - top_p: number             -> nucleus (top-p) sampling
			//  - temperature: number       -> sampling temperature (1.0 default)
			//  - repetition_penalty: num  -> penalize repeated tokens
			//  - no_repeat_ngram_size: num-> prevent repeating n-grams
			//  - length_penalty: number   -> apply length penalty for beams
			//  - num_return_sequences: num-> how many sequences to return
			//  - early_stopping: boolean  -> stop when best beam finishes
			//
			// Use whichever combination fits your need. Example (conservative beam search):
			const output = await captioner("./photo.png") as Array<{ generated_text: string }>;

			const image = await loadImage(processedImage);

			const imagemessage = encoder
				.align("center")
				.image(image, targetSize, targetSize, "atkinson")
				.newline(2);

			imagemessage.text(output[0]?.generated_text || "Image caption unavailable").newline(2);
			
			if (DEBUG) {
				imagemessage.text(ip ? `IP: ${ip}` : "IP: unknown").newline(2);

				imagemessage
					.text(userAgent ? `User-Agent: ${userAgent}` : "User-Agent: unknown")
					.newline(2);
			}
			client.write(imagemessage.cut().encode());
			return {
				success: true,
				message: "Photo processed and sent to printer.",
				debug: DEBUG ? { ip, userAgent, targetSize } : undefined,
			};
		},
	}),
	getCurrentPhotos: defineAction({
		accept: "json",
		input: z.object({}),
		handler: async (_input, _context) => {
			return new Promise<{ id: number; data: Buffer }[]>((resolve, reject) => {
				db.all(
					"SELECT id, data FROM images ORDER BY id DESC LIMIT 10",
					(err: Error | null, rows: { id: number; data: Buffer }[]) => {
						if (err) {
							reject(err);
						} else {
							const formattedRows = rows.map((row) => ({
								id: row.id,
								data: Buffer.from(row.data),
							}));
							resolve(formattedRows);
						}
					},
				);
			});
		},
	}),
};
