import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { verifyJWTToken } from "@repo/services/utils/utils";

import { createContext } from "./context";
import { env } from "../env";

const isProduction = env.NODE_ENV === "prod" || env.NODE_ENV === "production";
const INTERNAL_SERVER_ERROR_MESSAGE = "Internal server error";
type AuthTokenPayload = {
  userId?: string;
};

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

export const protectedProcedure = tRPCContext.procedure.use(({ ctx, next }) => {
  const UNAUTHORIZED = "UNAUTHORIZED";
  const UNAUTHORIZED_MESSAGE = "Authentication required";
  const INVALID_AUTH_TOKEN = "Invalid authentication token";

  const token = ctx.getCookie("token");

  if (!token) {
    throw new TRPCError({ code: UNAUTHORIZED, message: UNAUTHORIZED_MESSAGE });
  }

  const decodedToken = verifyJWTToken(token, env.JWT_SECRET);

  if (!decodedToken || typeof decodedToken === "string") {
    throw new TRPCError({ code: UNAUTHORIZED, message: INVALID_AUTH_TOKEN });
  }

  const { userId } = decodedToken as AuthTokenPayload;

  if (!userId) {
    throw new TRPCError({ code: UNAUTHORIZED, message: INVALID_AUTH_TOKEN });
  }

  return next({
    ctx: {
      ...ctx,
      user: { id: userId },
    },
  });
});
