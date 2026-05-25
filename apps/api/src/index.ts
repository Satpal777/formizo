import http from "node:http";
import { logger } from "@repo/logger";
import { app as expressApplication } from "./server";

import { env } from "./env";

let server: http.Server | undefined;
let isShuttingDown = false;

function shutdownFromFatalError(error: unknown, message: string) {
  logger.error(message, { error });
  shutdown(1);
}

function shutdown(exitCode: number) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  if (!server) {
    process.exit(exitCode);
  }

  server.close(() => {
    process.exit(exitCode);
  });

  setTimeout(() => {
    process.exit(exitCode);
  }, 10_000).unref();
}

process.on("uncaughtException", (error) => {
  shutdownFromFatalError(error, "Uncaught exception");
});

process.on("unhandledRejection", (reason) => {
  shutdownFromFatalError(reason, "Unhandled promise rejection");
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM");
  shutdown(0);
});

process.on("SIGINT", () => {
  logger.info("Received SIGINT");
  shutdown(0);
});

async function init() {
  try {
    server = http.createServer(expressApplication);
    const PORT: number = env.PORT ? +env.PORT : 9000;

    server.on("error", (error) => {
      shutdownFromFatalError(error, "HTTP server error");
    });

    server.listen(PORT, () => {
      logger.info(`http server is running on PORT ${PORT}`);
    });
  } catch (err) {
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

init();
