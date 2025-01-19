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
            console.log("input", input);
            const image = await loadImage(input.imageDataUrl);
            const imagemessage = encoder
                .align("center")
                .image(image, image.width, image.height, "floydsteinberg")
                .rule({ width: 42 })
                .cut()
                .encode();
            console.log("imagemessage", imagemessage);
            client.write(imagemessage);
            // client.write(encoder.align("center").qrcode(input.imageDataUrl, { model: 1 }).cut().encode());
            return `Photo printed!`;
        },
    }),
};
