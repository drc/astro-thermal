import net from "node:net";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

const PORT: number = 9100;
const HOST: string = "10.0.1.128";

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
	console.log("[🧾 THERMAL] Connecting to printer for the first time");
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

// biome-ignore lint:
declare const globalThis: {
	printerClientGlobal: ReturnType<typeof printerClientSingleton>;
	printerConnected: boolean;
} & typeof global;

export const encoder: ReceiptPrinterEncoder = new ReceiptPrinterEncoder({
	feedBeforeCut: 5,
});
