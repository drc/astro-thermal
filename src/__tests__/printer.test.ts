import { describe, it, expect, vi } from "vitest";

async function importPrinterWithHost(): Promise<typeof import("@/lib/printer")> {
  vi.resetModules();
  process.env.PRINTER_HOST = "10.0.1.128";
  return import("@/lib/printer");
}

describe("printer module", () => {
  it("exports a socket-like client and encoder", async () => {
    const { client, encoder } = await importPrinterWithHost();
    expect(client).toBeDefined();
    expect(typeof encoder.encode).toBe("function");
  });
});
