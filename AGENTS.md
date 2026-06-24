# AGENTS.md

- Package manager: `pnpm@10.33.2`.
- Main commands: `pnpm dev`, `pnpm build`, `pnpm start` (runs `node dist/server/entry.mjs`), `pnpm test`, `pnpm test:watch`.
- No `pnpm lint`, `pnpm format`, or `pnpm typecheck` scripts exist. Use `pnpm biome check`/`pnpm biome format` directly.
- App entry is `src/pages/index.astro`; main UI is `src/components/Photobooth.astro`. Secondary page at `/todo?item=...` (`src/pages/todo.astro`).
- Server actions at `src/actions/index.ts`; printer socket at `src/lib/printer.ts`; SQLite at `src/lib/database.ts`.
- Path alias `@` → `src` in Astro, Vitest, and tsconfig.
- `output: "server"` + `@astrojs/node` adapter in `standalone` mode. `security.checkOrigin: false`.
- Allowed dev hosts: `*.ngrok-free.app`, `*.trycloudflare.com`, `development.dancigrang.dev`.
- Printer defaults: `10.0.1.128:9100` hard-coded in `src/lib/printer.ts`. Socket is a global singleton.
- `DEBUG=true` env var adds IP + user-agent text to printed output.
- DB defaults to `src/lib/images.db`; tests override with `IMAGES_DB_PATH=:memory:`.
- Lint/format via **Biome** (not oxlint/oxfmt). `biome-ignore` comments in printer.ts.
- cloudflared tunnel: `cloudflared tunnel run` with `config.yml` (gitignored; uses tunnel ID `dd3d6d80-0cbc-4008-a982-042a2adb9e93`).
- Docker: builds and pushes to `ghcr.io/drc/astro-thermal:latest` on main branch pushes.
- Caddyfile at project root for local TLS reverse proxy (`astro.localhost → :4321`).
- Middleware at `src/middleware/index.ts` exists but rate limiting is commented out — always passes through.
- `photo.png`, `dist/`, `.astro/`, `node_modules/`, and `*.db` are gitignored.
