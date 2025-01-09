import { client } from "./printer.js";
import { createCanvas, loadImage } from "canvas";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import sharp from "sharp";

// @ts-ignore
const encoder = new ReceiptPrinterEncoder({ createCanvas, imageMode: "raster", feedBeforeCut: 7 });

export async function printImage(image_url: string) {
    const response = await fetch(image_url);
    const arrayBuffer = await response.arrayBuffer();
    // convert all passed in images to jpegs
    let buffer = await sharp(arrayBuffer).jpeg().toBuffer();
    const image = await loadImage(buffer);
    const aspectRatio = image.width / image.height;
    const width = 520;
    const height = Math.floor(width / aspectRatio / 8) * 8;
    const imagemessage = encoder.align("center").image(image, width, height, "floydsteinberg").rule({ width: 42 }).encode();
    client.write(imagemessage);
    client.write(encoder.align("center").qrcode(image_url, { model: 1 }).cut().encode());
}
