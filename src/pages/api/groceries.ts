import { client, encoder } from "@/lib/printer";
import { takeScreenshot } from "@/lib/takeScreenshot";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const { list } = await request.json();
    console.log(list);

    if (!list) {
        return new Response("", { status: 400 });
    }

    const encodedMessage = encoder
        .box(
            {
                width: 30,
                align: "left",
                style: "double",
                marginLeft: 10,
            },
            (encoder) => encoder.align("center").text("Groceries")
        )
        .newline(2)
        .line(list.map((item: string) => `[ ] ${item}`).join("\n"))
        .cut()
        .encode();
    // client.write(encodedMessage);

    takeScreenshot(`http://localhost:4321/groceries?list=${list.join(",")}`);

    return new Response("", { status: 200 });
};
