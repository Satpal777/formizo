import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { verifyJWTToken } from "@repo/services/utils/utils";

import { userService } from "./services";
import { createContext } from "./context";
import { env } from "../env";
import { clearAuthCookie, setAuthCookie } from "./routes/auth/cookie";

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

function getUserIdFromToken(token: string) {
  const decodedToken = verifyJWTToken(token, env.JWT_SECRET);

  if (!decodedToken || typeof decodedToken === "string") {
    return null;
  }

  const { userId } = decodedToken as AuthTokenPayload;
  return userId ?? null;
}

async function refreshAuthFromCookie(ctx: Awaited<ReturnType<typeof createContext>>) {
  const refreshToken = ctx.getCookie("refreshToken");

  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await userService.refreshToken({ refreshToken });
    setAuthCookie(ctx, tokens.token, tokens.refreshToken);
    return getUserIdFromToken(tokens.token);
  } catch {
    clearAuthCookie(ctx);
    return null;
  }
}

export const protectedProcedure = tRPCContext.procedure.use(async ({ ctx, next }) => {
  const UNAUTHORIZED = "UNAUTHORIZED";
  const UNAUTHORIZED_MESSAGE = "Authentication required";

  const token = ctx.getCookie("token");
  const userId = token ? getUserIdFromToken(token) : await refreshAuthFromCookie(ctx);
  const refreshedUserId = userId ?? (token ? await refreshAuthFromCookie(ctx) : null);

  if (!refreshedUserId) {
    clearAuthCookie(ctx);
    throw new TRPCError({ code: UNAUTHORIZED, message: UNAUTHORIZED_MESSAGE });
  }

  return next({
    ctx: {
      ...ctx,
      user: { id: refreshedUserId },
    },
  });
});
