import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const server = {
    printPhoto: defineAction({
        input: z.object({
            imageData: z.string(),
        }),
        handler: async (input, _context) => {
            return `Hello, ${input.imageData}!`;
        },
    }),
};
