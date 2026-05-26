import { TRPCContext } from "../../context";

const TOKEN = "token";
const REFRESH_TOKEN = "refreshToken";
const nodeEnv = process.env.NODE_ENV as string | undefined;
const isProduction = nodeEnv === "prod" || nodeEnv === "production";
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
  path: "/",
};

export function setAuthCookie(ctx: TRPCContext, token: string, refreshToken: string) {
  ctx.createCookie(TOKEN, token, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  ctx.createCookie(REFRESH_TOKEN, refreshToken, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function getAuthTokensFromCookies(ctx: TRPCContext) {
  return [ctx.getCookie(TOKEN), ctx.getCookie(REFRESH_TOKEN)];
}

export function clearAuthCookie(ctx: TRPCContext) {
  ctx.clearCookie(TOKEN, authCookieOptions);
  ctx.clearCookie(REFRESH_TOKEN, authCookieOptions);
}
