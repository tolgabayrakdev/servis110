import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: env.AUTH_COOKIE_MAX_AGE_MS,
  path: "/",
};

export const authCookie = {
  set(response: Response, token: string) {
    response.cookie(env.AUTH_COOKIE_NAME, token, cookieOptions);
  },

  clear(response: Response) {
    const { maxAge: _maxAge, ...clearOptions } = cookieOptions;
    response.clearCookie(env.AUTH_COOKIE_NAME, clearOptions);
  },
};
