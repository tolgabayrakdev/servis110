import { createContext, useContext } from "react";
import type { User } from "@/types/api-types";

export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { name: string; workshopName: string };
export type UpdateAccountInput = {
  name: string;
  email: string;
  workshopName: string;
};
export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  verifyEmail: (input: { email: string; code: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateAccount: (input: UpdateAccountInput) => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  deleteAccount: (input: {
    password: string;
    confirmation: string;
  }) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth, AuthProvider içinde kullanılmalıdır");
  return context;
}
