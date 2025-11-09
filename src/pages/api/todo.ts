import type { APIRoute } from "astro";
import { takeScreenshot } from "@/lib/takeScreenshot";

export const POST: APIRoute = async ({ request }) => {
	const { todo } = await request.json();

	if (!todo) {
		return new Response("", { status: 400 });
	}

	takeScreenshot(`http://localhost:4321/todo?item=${encodeURIComponent(todo)}`);

	return new Response("", { status: 201 });
};
