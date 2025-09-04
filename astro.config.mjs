// @ts-check
import { defineConfig } from "astro/config";
import path from "node:path";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
	adapter: node({
		mode: "standalone",
	}),
	output: "server",
	server: {
		allowedHosts: [".ngrok-free.app", ".trycloudflare.com"],
	},
	vite: {
		resolve: {
			alias: {
				"@": path.resolve("./src"),
			},
		},
	},
});
