import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { createCanvas, loadImage } from "canvas";
import { client } from "@/lib/printer";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import sharp from "sharp";

// @ts-ignore
const encoder = new ReceiptPrinterEncoder({ createCanvas, imageMode: "raster", feedBeforeCut: 8 });

export const server = {
    printPhoto: defineAction({
        input: z.object({
            imageDataUrl: z.string().includes("data:image/png;base64,"),
            message: z.string().optional(),
            ip_address: z.string().optional(),
            user_agent: z.string().optional(),
        }),
        handler: async (input, _context) => {
            try {
                const imageBuffer = Buffer.from(input.imageDataUrl.split(",")[1], "base64");
                const sharpInstance = await sharp(imageBuffer)
                    .metadata()
                    .then(({ width = 0, height = 0 }) =>
                        sharp(imageBuffer)
                            .sharpen({ sigma: 2 })
                    );
                sharpInstance.png().toFile("./photo.png");
                const processedBuffer = await sharpInstance.toBuffer();
                const processedBase64 = `data:image/png;base64,${processedBuffer.toString("base64")}`;
                const image = await loadImage(processedBase64);
                const width = image.width;
                const height = image.height;
                const imagemessage = encoder.align("center").image(image, width, height, "atkinson").align("center");
                if (input.message) {
                    imagemessage.text(input.message);
                    imagemessage.newline(2);
                }
                imagemessage.text(input.ip_address || "No IP Address");
                imagemessage.newline(2);
                imagemessage.text(input.user_agent || "No User Agent");
                client.write(imagemessage.cut().encode());
                return `Photo printed!`;
            } catch (e) {
                console.error(e);
            }
        },
    }),
};
