import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthUser } from "../types/index.js";

export const tokenService = {
  sign(user: AuthUser): string {
    return jwt.sign(user, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] });
  },

  verify(token: string): AuthUser {
    return jwt.verify(token, env.JWT_SECRET) as AuthUser;
  },
};
