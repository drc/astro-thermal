import { chromium } from "playwright";
import { createCanvas, loadImage } from "canvas";
import { client } from "@/lib/printer";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import sharp from "sharp";

// @ts-ignore
const encoder = new ReceiptPrinterEncoder({ createCanvas, feedBeforeCut: 7 });

export async function takeScreenshot(url: string) {
    //playwright code here
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    const ss = await page.locator(".groceries").screenshot({ path: "screenshot.png" });
    await browser.close();
    const buffer = await sharp(ss).jpeg().toBuffer();
    const image = await loadImage(buffer);
    console.log(image.naturalWidth, image.naturalHeight, image.width, image.height);
    const aspectRatio = image.width / image.height;
    const width = image.width;
    const height = Math.floor(width / aspectRatio / 8) * 8;

    let result = encoder.align("center").image(image, width, height, "floydsteinberg").cut().encode();
    console.log(`Writing to printer...`);
    client.write(result);
    return;
}
