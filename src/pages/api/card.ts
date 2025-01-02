import { client, encoder } from "@/lib/printer";
import { printImage } from "@/lib/printImage";
import type { APIRoute } from "astro";

interface CardRequest {
    message: string;
    image_url?: string;
    user: string;
}

export const POST: APIRoute = async ({ request }) => {
    const { message, image_url, user }: CardRequest = await request.json();

    if (!message || !user) {
        return new Response("", { status: 400 });
    }

    if (image_url?.includes("webp")) {
        return new Response("WEBP not supported", { status: 500 });
    }

    const encodedMessage = encoder
        .bold()
        .invert()
        .text(user)
        .bold(false)
        .invert(false)
        .text(` ${message}`)
        .rule()
        .encode();

    client.write(encodedMessage);

    if (image_url) {
        printImage(image_url);
    }

    return new Response("", { status: 200 });
};

export const prerender = false;
