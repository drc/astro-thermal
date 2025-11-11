FROM mcr.microsoft.com/playwright:v1.40.0-jammy AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack install -g pnpm@10.15.1
ENV COREPACK_INTEGRITY_KEYS=0

COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# for Image Captioning model
ENV ORT_NUM_THREADS=4
ENV ORT_DISABLE_AFFINITY=1

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

LABEL org.opencontainers.image.source=https://github.com/drc/astro-thermal
LABEL org.opencontainers.image.description="Astro API to interface with a Rongata receipt printer"

CMD ["pnpm", "start"]