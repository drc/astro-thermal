import type { APIRoute } from "astro";
import { takeScreenshot } from "@/lib/takeScreenshot";

export const POST: APIRoute = async ({ request }) => {
	const { todo } = await request.json();

	if (!todo) {
		return new Response("Missing to-do item", { status: 400 });
	}

	await takeScreenshot(`http://localhost:4321/todo?item=${encodeURIComponent(todo)}`);

	return new Response("", { status: 201 });
};
