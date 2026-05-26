import { CookieOptions, Request, Response } from "express";

const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;

export const defaultCookieOptions: CookieOptions = {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: DAYS * 7, 
}

export function cookieFactory(res: Response) {
    return function (name: string, value: string, options: CookieOptions) {
        res.cookie(name, value, options);
    }
}

export function getCookieFactory(req:Request) {
    return function getCookie(name: string) {
        return req.cookies?.[name];
    };
}

export function clearCookieFactory(res: Response) {
    return function clearCookie(name: string, options?: CookieOptions) {
        res.clearCookie(name, options);
    };
}
