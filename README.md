# Astro Thermal Printer 🚀

A small Astro web app for capturing photos from a camera (phone/tablet) and printing them to a networked thermal receipt printer. It includes a photobooth-style UI, server-side image processing (sharp/canvas), and helper routines to encode images and text for common receipt printers.

## Features

- Mobile-friendly photobooth UI that captures a camera image, accepts an optional message, and sends a print request.
- Server-side image processing using sharp + canvas to convert photos to printer-friendly bitmaps.
- Receipt encoding via `@point-of-sale/receipt-printer-encoder` to send images, text, and QR codes to thermal printers.
- Example API route for printing short message cards programmatically.

## Quick demo / preview

- Open the app locally and use the camera controls on a phone or device with a camera to take a photo and print.
- The UI component is `src/components/Photobooth.astro` and the app entry is `src/pages/index.astro`.

If you want to preview quickly (no printer), you can run the dev server and use the photobooth UI to capture images; server image processing will still run and save a `photo.png` in the project root.

## Requirements

- Node.js (v18+ recommended)
- pnpm (project uses pnpm)
- System libraries required by `sharp` and `canvas` (libvips, Cairo, etc.). On macOS these are commonly provided by Homebrew.

On macOS you can install dependencies with Homebrew (examples):

```zsh
# Homebrew (if needed)
brew install pkg-config cairo pango libpng jpeg giflib librsvg vips
```

## Install

Install project dependencies with pnpm:

```zsh
pnpm install
```

## Development

Run the Astro dev server (hot reload):

```zsh
pnpm dev
```

Open the site at the URL shown by Astro (usually [http://localhost:4321](http://localhost:4321)). The photobooth UI is the root page (`/`).

## Build & Preview

```zsh
pnpm build
pnpm preview
```

You can run the built server with:

```zsh
pnpm start
```

## Where the app lives

Most of the application logic and UX is inside the photobooth component and the server actions. Important files:

- `src/components/Photobooth.astro` — main client UI that:
  - accesses the camera, toggles torch and front/back facing, captures a PNG data URL, and calls the server action `printPhoto` (via Astro actions).
    - writes optional metadata (ip and user agent) into hidden inputs sent along with the photo.
- `src/actions/index.ts` — server-side image pipeline and Astro actions:
  - defines the `handlePhoto` action in source. In the compiled app the action is exposed as `printPhoto`.
    - applies EXIF-aware rotation, sharpening, converts to black and white, and encodes images for the receipt printer.
- `src/lib/printer.ts` — TCP socket client that connects to the networked thermal printer. Defaults in source are HOST `10.0.1.128` and PORT `9100`.
- `src/lib/printImage.ts` — helper used to fetch external image URLs and convert/encode them for printing (uses `sharp` and `canvas`).
- `src/pages/api/*` — convenience API endpoints for printing programmatically. The repo contains `card.ts`, `groceries.ts`, `spotify.ts`, and `index.astro` in the `/api` folder.

This README was generated from the project's source files to reflect where behavior lives and how calls flow from the client to the printer.

## How printing works (wiring details)

- The low-level TCP connection to the printer is implemented in `src/lib/printer.ts`.
  - Default host: `10.0.1.128`
  - Default port: `9100`
  - These values are constants in `printer.ts`. If your printer is on a different IP, change `HOST`/`PORT` in that file or replace it with an env-driven solution.
- Server-side image processing & encoding lives in `src/actions/index.ts` and `src/lib/printImage.ts`:
  - `src/components/Photobooth.astro` captures the camera image and calls the server action `printPhoto`.
  - `printPhoto` accepts a base64 data URL (`imageDataUrl`) and optional metadata (`message`, `ip_address`, `user_agent`) and performs sharpening, conversion to black/white, and encodes the image with `ReceiptPrinterEncoder`.
  - `src/pages/api/card.ts` provides a separate API endpoint for printing short text "cards" (POST JSON with `message`, `user`). It also calls `printImage` when `image_url` is provided.

Important files to review:

- `src/components/Photobooth.astro` — client camera UI and action invocation.
- `src/actions/index.ts` — server-side action `handlePhoto` / `printPhoto` that processes and sends the image to the printer.
- `src/lib/printImage.ts` — helper for fetching external images and encoding them for the printer.
- `src/lib/printer.ts` — TCP socket client used to send bytes to the networked thermal printer.

## Configuration notes

- Printer host/port are hard-coded in `src/lib/printer.ts` (HOST and PORT). For production you may want to read those from environment variables and fall back to defaults.
- `DEBUG` is read in `src/actions/index.ts` (via `process.env.DEBUG`) and will include request IP / user-agent text on printed receipts when enabled.

## API / Actions

- Client-side code calls the server action `printPhoto` using Astro actions. The action expects:
  - `imageDataUrl` (string) — a data URL including the `data:image/png;base64,` prefix.
  - `message` (optional) — short text to print below the photo.
  - `ip_address` and `user_agent` (optional) — for debug printing when `DEBUG` is enabled.

- Example JSON POST to the card API (`src/pages/api/card.ts`):

```json
{
 "message": "Hello world",
 "image_url": "https://example.com/photo.jpg",
 "user": "Kiosk"
}
```

POST that JSON to `/api/card` and the server will encode and send the text and image to the printer.

## Troubleshooting

- canvas/sharp install errors:
  - Ensure native libraries are installed (see Homebrew example above).
  - Rebuild native modules if Node was upgraded: `pnpm rebuild`.
- Printer connection issues:
  - Check network connectivity and that the printer accepts raw TCP on port 9100.
  - Modify `HOST` and `PORT` in `src/lib/printer.ts` to point to your printer.
- If the server doesn't seem to process images, check that `photo.png` (the processed file) is created — `src/actions/index.ts` writes `./photo.png` for debugging.

## Development tips & next steps

- Make printer host configurable via environment variables and fall back to the current constants.
- Add a diagnostic page that shows the printer connection status.
- Add tests for the image pipeline (sharp transformations) and a small mock for the printer socket.

## Contributing

Contributions are welcome. Open an issue or submit a PR. Keep changes small and include tests where appropriate.
