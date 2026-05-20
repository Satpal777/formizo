import { initTRPC } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";

const nodeEnv = process.env["NODE_ENV"] as string | undefined;
const isProduction = nodeEnv === "prod" || nodeEnv === "production";
const INTERNAL_SERVER_ERROR_MESSAGE = "Internal server error";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({
    errorFormatter({ shape }) {
      if (!isProduction) {
        return shape;
      }

      const isInternalServerError = shape.data.code === "INTERNAL_SERVER_ERROR";
      const { stack: _stack, ...data } = shape.data;

      return {
        ...shape,
        message: isInternalServerError ? INTERNAL_SERVER_ERROR_MESSAGE : shape.message,
        data,
      };
    },
  });

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;
