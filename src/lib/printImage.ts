import { client } from "./printer.js";
import { createCanvas, loadImage, type Image } from "canvas";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import sharp from "sharp";

type Align = "left" | "center" | "right";

interface ReceiptEncoder {
	align(position: Align): ReceiptEncoder;
	image(
		img: Image,
		width: number,
		height: number,
		dither?: string,
	): ReceiptEncoder;
	rule(opts?: { width?: number }): ReceiptEncoder;
	qrcode(data: string, opts?: { model?: number }): ReceiptEncoder;
	cut(): ReceiptEncoder;
	encode(): Buffer;
}

interface ReceiptPrinterConstructor {
	new (opts?: {
		createCanvas?: typeof createCanvas;
		imageMode?: string;
		feedBeforeCut?: number;
	}): ReceiptEncoder;
}

const EncoderClass =
	ReceiptPrinterEncoder as unknown as ReceiptPrinterConstructor;
const encoder: ReceiptEncoder = new EncoderClass({
	createCanvas,
	imageMode: "raster",
	feedBeforeCut: 7,
});

export async function printImage(
	image_url: string,
	alt_url?: string,
): Promise<void> {
	const response = await fetch(image_url);
	if (!response.ok)
		throw new Error(
			`Failed to fetch image ${image_url}: ${response.status} ${response.statusText}`,
		);
	const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
	const inputBuffer: Buffer = Buffer.from(arrayBuffer);
	// convert all passed in images to jpegs
	const buffer: Buffer = await sharp(inputBuffer).jpeg().toBuffer();
	const image: Image = (await loadImage(buffer)) as Image;
	if (image.width === 0 || image.height === 0)
		throw new Error("Invalid image dimensions");
	const aspectRatio = image.width / image.height;
	const width = 520;
	const height = Math.max(8, Math.floor(width / aspectRatio / 8) * 8);

	const imagemessage: Buffer = encoder
		.align("center")
		.image(image, width, height, "floydsteinberg")
		.rule({ width: 42 })
		.encode();
	client.write(imagemessage);

	const qrcodeMessage: Buffer = encoder
		.align("center")
		.qrcode(alt_url ?? image_url, { model: 1 })
		.cut()
		.encode();
	client.write(qrcodeMessage);
}
