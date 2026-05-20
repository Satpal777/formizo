import express from "express";
import type { ErrorRequestHandler } from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import cookieParser from "cookie-parser";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";

export const app = express();
const isProduction = env.NODE_ENV === "prod";
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Formizo API",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

if (env.NODE_ENV !== "prod") {
  app.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );
}

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
  return res.json({ message: "Formizo is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Formizo server is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
    onError({ error, path, type }) {
      logger.error("OpenAPI request failed", { error, path, type });
    },
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
    onError({ error, path, type }) {
      logger.error("tRPC request failed", { error, path, type });
    },
  }),
);

const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const message = error instanceof Error ? error.message : "Unknown error";

  logger.error("Unhandled HTTP error", {
    error,
    method: req.method,
    url: req.originalUrl,
  });

  if (res.headersSent) {
    return;
  }

  const responseBody: { message: string; stack?: string } = {
    message: isProduction ? "Internal server error" : message,
  };

  if (!isProduction && error instanceof Error) {
    responseBody.stack = error.stack;
  }

  res.status(500).json(responseBody);
};

app.use(errorHandler);

export default app;
