import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { createCanvas, loadImage } from "canvas";
import { client } from "@/lib/printer";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

// @ts-ignore
const encoder = new ReceiptPrinterEncoder({ createCanvas, imageMode: "raster", feedBeforeCut: 7 });


export const server = {
    printPhoto: defineAction({
        input: z.object({
            imageDataUrl: z.string(),
        }),
        handler: async (input, _context) => {
            const image = await loadImage(input.imageDataUrl);
            const imagemessage = encoder
                .align("center")
                .image(image, image.width, image.height, "floydsteinberg")
                .rule({ width: 42 })
                .cut()
                .encode();
            client.write(imagemessage);
            return `Photo printed!`;
        },
    }),
};
