import { describe, it, expect, vi } from "vitest";
import { client, encoder } from "@/lib/printer";

describe("printer module", () => {
	it("exports a socket-like client and encoder", () => {
		expect(client).toBeDefined();
		expect(typeof encoder.encode).toBe("function");
	});
});
