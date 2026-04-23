# AGENTS.md

- Package manager: `pnpm@10.33.2`.
- Main commands: `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm start`, `pnpm test`, `pnpm test:watch`.
- App entry is `src/pages/index.astro`; the main UI lives in `src/components/Photobooth.astro`.
- Server actions live in `src/actions/index.ts`; printer socket code lives in `src/lib/printer.ts`; SQLite setup lives in `src/lib/database.ts`.
- Path alias `@` points to `src` in both Astro and Vitest config.
- Astro is configured for `output: "server"` with the Node adapter in `standalone` mode.
- Dev server allows `*.ngrok-free.app`, `*.trycloudflare.com`, and `development.dancigrang.dev` hosts.
- Printer defaults are hard-coded in `src/lib/printer.ts` as `10.0.1.128:9100`.
- `DEBUG` in `src/actions/index.ts` adds IP and user-agent text to printed output.
- The database file defaults to `src/lib/images.db`; tests override it with `IMAGES_DB_PATH=:memory:`.
- `photo.png`, `dist/`, `.astro/`, `node_modules/`, and `*.db` are generated or local-only and ignored.
