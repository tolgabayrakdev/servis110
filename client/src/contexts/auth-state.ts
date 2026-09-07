import { createContext, useContext } from "react";
import type { User } from "@/types/api-types";

export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { name: string; workshopName: string };

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth, AuthProvider içinde kullanılmalıdır");
  return context;
}
