import net from "node:net";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

const PORT: number = Number(process.env.PRINTER_PORT) || 9100;
const HOST: string = process.env.PRINTER_HOST ?? "";

const printerClientSingleton = (): net.Socket => {
  console.log("Creating new socket...");
  return new net.Socket();
};
export const client: net.Socket =
  // biome-ignore lint:
  globalThis.printerClientGlobal ?? printerClientSingleton();
// biome-ignore lint:
globalThis.printerClientGlobal = client;

// biome-ignore lint:
if (!globalThis.printerConnected) {
  if (!HOST) {
    throw new Error("[🧾 THERMAL] PRINTER_HOST env var is not set (e.g. PRINTER_HOST=10.0.1.128)");
  }
  console.log(`[🧾 THERMAL] Connecting to printer at ${HOST}:${PORT}`);
  client.connect(PORT, HOST, () => {
    globalThis.printerConnected = true;
    console.log("[🧾 THERMAL] Connected to printer");
  });
}

client.on("data", (data): void => {
  console.log("[🧾 THERMAL] Received:", data.toString("hex"));
});

client.on("error", (err): void => {
  console.error("[🧾 THERMAL] Error connecting to printer:", err);
});

client.on("close", (): void => {
  console.log("[🧾 THERMAL] Disconnected from printer");
});

const socketEvents: string[] = [
  "close",
  "connectionAttempt",
  "connectionAttemptFailed",
  "connectionAttemptTimeout",
  "drain",
  "end",
  "lookup",
  "connect",
  "ready",
  "timeout",
];

for (const event of socketEvents) {
  client.on(event, (_data): void => {
    console.log("[🧾 THERMAL] Event:", event);
  });
}

// oxlint-disable-next-line no-shadow-restricted-names
declare const globalThis: {
  printerClientGlobal: ReturnType<typeof printerClientSingleton>;
  printerConnected: boolean;
} & typeof global;

export const encoder: ReceiptPrinterEncoder = new ReceiptPrinterEncoder({
  feedBeforeCut: 5,
});
