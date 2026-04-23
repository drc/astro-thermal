# Astro Thermal Printer 🚀

A small Astro web app for capturing photos from a camera (phone/tablet) and printing them to a networked thermal receipt printer. It includes a photobooth-style UI, server-side image processing (sharp/canvas), and helper routines to encode images and text for common receipt printers.

## Features

- Mobile-friendly photobooth UI that captures a camera image, accepts an optional message, and sends a print request.
- Server-side image processing using sharp + canvas to convert photos to printer-friendly bitmaps.
- Receipt encoding via `@point-of-sale/receipt-printer-encoder` to send images, text, and QR codes to thermal printers.
- Example API route for printing short message cards programmatically.

## Quick demo / preview

- Open the app locally and use the camera controls on a phone or device with a camera to take a photo and print.

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

## Troubleshooting

- canvas/sharp install errors:
  - Ensure native libraries are installed (see Homebrew example above).
  - Rebuild native modules if Node was upgraded: `pnpm rebuild`.
- Printer connection issues:
  - Check network connectivity and that the printer accepts raw TCP on port 9100.
  - Modify `HOST` and `PORT` in `src/lib/printer.ts` to point to your printer.
- If the server doesn't seem to process images, check that `photo.png` (the processed file) is created — `src/actions/index.ts` writes `./photo.png` for debugging.

## Contributing

Contributions are welcome. Open an issue or submit a PR. Keep changes small and include tests where appropriate.
