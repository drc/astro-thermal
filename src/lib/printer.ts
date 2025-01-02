import net from "node:net";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

const PORT = 9100;
const HOST = "10.0.1.128";

const printerClientSingleton = () => {
    console.log("Creating new socket...");
    return new net.Socket();
}

export const client: net.Socket = globalThis.printerClientGlobal ?? printerClientSingleton();
globalThis.printerClientGlobal = client;

if (!globalThis.printerConnected) {
    console.log("[🧾 THERMAL] Connecting to printer for the first time");
    client.connect(PORT, HOST, () => {
        globalThis.printerConnected = true;
        console.log("[🧾 THERMAL] Connected to printer");
    })
}

client.on('data', (data) => {
    console.log('[🧾 THERMAL] Received:', data.toString('hex'));
});

client.on('error', (err) => {
    console.error('[🧾 THERMAL] Error connecting to printer:', err);
});

client.on('close', () => {
    console.log('[🧾 THERMAL] Disconnected from printer');
});

const socketEvents = ['close',
    'connectionAttempt',
    'connectionAttemptFailed',
    'connectionAttemptTimeout',
    'drain',
    'end',
    'lookup',
    'connect',
    'ready',
    'timeout'];

socketEvents.forEach((event) => {
    client.on(event, (_data) => {
        console.log('[🧾 THERMAL] Event:', event);
    });
});

console.log(ReceiptPrinterEncoder.printerModels)


declare const globalThis: {
    printerClientGlobal: ReturnType<typeof printerClientSingleton>;
    printerConnected: boolean;
} & typeof global;

export const encoder: ReceiptPrinterEncoder = new ReceiptPrinterEncoder({
    feedBeforeCut: 10
});