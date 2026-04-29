import { client, encoder } from "@/lib/printer";
import { printImage } from "@/lib/printImage";
import type { APIRoute } from "astro";

interface SpotifyRequest {
	song_info: { track: string; artist: string; album: string; url: string };
	image_url?: string;
	user: string;
}

export const POST: APIRoute = async ({ request }) => {
	const { song_info, image_url, user }: SpotifyRequest = await request.json();

	if (!song_info || !user) {
		return new Response("", { status: 400 });
	}

	// if (image_url?.includes("webp")) {
	//     return new Response("WEBP not supported", { status: 500 });
	// }

	const encodedMessage = encoder
		.bold()
		.invert()
		.text(user)
		.bold(false)
		.invert(false)
        .newline(1)
		.text(` ${song_info.track} by ${song_info.artist}`)
		.rule()
		.encode();

	client.write(encodedMessage);

	if (image_url) {
		await printImage(image_url, song_info.url);
	}

	return new Response("", { status: 200 });
};
