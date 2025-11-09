import { chromium } from "playwright";
import { client, encoder } from "@/lib/printer";
import sharp from "sharp";
import { ImageData } from "canvas";

export async function takeScreenshot(path: string) {
	const browser = await chromium.launch({ headless: true });
	try {
		const page = await browser.newPage();
		await page.goto(path);
		const ss = await page
			.locator("main")
			.screenshot({ path: "screenshot.png" });

		// Convert screenshot to raw RGBA pixel buffer at the desired size
		const { data, info } = await sharp(ss)
			.ensureAlpha() // make sure we have RGBA
			.raw() // get raw pixel data
			.toBuffer({ resolveWithObject: true });

		const height = Math.floor(info.height / 8) * 8;

		// Create ImageData from the raw buffer (Uint8ClampedArray required)
		const imageData = new ImageData(
			new Uint8ClampedArray(data),
			info.width,
			info.height,
		);
		// pass the ImageData to the printer encoder
		encoder
			.align("center")
			.image(imageData, info.width, height, "atkinson")
			.newline(2);
		client.write(encoder.cut().encode());
	} finally {
		await browser.close();
	}
}
