FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/logger/package.json packages/logger/package.json
COPY packages/services/package.json packages/services/package.json
COPY packages/trpc/package.json packages/trpc/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY apps apps
COPY packages packages

ENV IS_SERVER_BUILD="true"
ENV BASE_URL="http://localhost:9000"
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV JWT_SECRET="build-time-jwt-secret"
ENV JWT_EXPIRES_IN="1h"
ENV REFRESH_TOKEN_SECRET="build-time-refresh-secret"
ENV REFRESH_TOKEN_EXPIRES_IN="30d"
ENV RATE_LIMIT_ENABLED="true"
ENV RATE_LIMIT_WINDOW_MS="60000"
ENV RATE_LIMIT_MAX="120"
ENV TRUST_PROXY="false"
ENV DEVELOPER_PLAN_MAX_FORMS="10"
ENV PRO_PLAN_MAX_FORMS="unlimited"
ENV ONBOARDING_CTA_URL="http://localhost:3000"
ENV EMAIL_VERIFICATION_URL="http://localhost:3000/verify-email"
ENV SMTP_PORT="587"
ENV SMTP_SECURE="false"

RUN pnpm --filter @repo/api build

FROM base AS runner

ENV NODE_ENV="production"
ENV PORT="9000"

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages ./packages

EXPOSE 9000

CMD ["pnpm", "--filter", "@repo/api", "start"]
