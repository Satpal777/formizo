import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { clearCookieFactory, cookieFactory, getCookieFactory } from "./utils/cookie";

export interface TRPCContext {
    createCookie: ReturnType<typeof cookieFactory>;
    getCookie: ReturnType<typeof getCookieFactory>;
    clearCookie: ReturnType<typeof clearCookieFactory>;
}

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<TRPCContext> {
    const ctx = {
        createCookie: cookieFactory(res),
        getCookie: getCookieFactory(req),
        clearCookie: clearCookieFactory(res),
    }
    return ctx;
}

export type Context = Awaited<ReturnType<typeof createContext>>;
