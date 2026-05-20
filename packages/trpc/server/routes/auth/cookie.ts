import { TRPCContext } from "../../context";

const TOKEN = "token";
const REFRESH_TOKEN = "refreshToken";

export function setAuthCookie(ctx:TRPCContext, token: string, refreshToken: string) {
    ctx.createCookie(TOKEN, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    ctx.createCookie(REFRESH_TOKEN, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

export function getAuthTokensFromCookies(ctx:TRPCContext) {
    return [ctx.getCookie(TOKEN), ctx.getCookie(REFRESH_TOKEN)];
}

export function clearAuthCookie(ctx:TRPCContext) {
    ctx.clearCookie(TOKEN);
    ctx.clearCookie(REFRESH_TOKEN);
}