import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/api-types";
import { AuthContext } from "./auth-state";
import type { AuthContextValue } from "./auth-state";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ data: User }>("/auth/me")
      .then((response) => setUser(response.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(input) {
        const response = await apiClient.post<{ data: { user: User } }>(
          "/auth/login",
          input,
        );
        setUser(response.data.user);
      },
      async register(input) {
        const response = await apiClient.post<{ data: { user: User } }>(
          "/auth/register",
          input,
        );
        setUser(response.data.user);
      },
      async logout() {
        await apiClient.post("/auth/logout");
        setUser(null);
      },
      async updateAccount(input) {
        const response = await apiClient.patch<{ data: User }>(
          "/auth/account",
          input,
        );
        setUser(response.data);
      },
      async changePassword(input) {
        await apiClient.patch("/auth/password", input);
      },
      async deleteAccount(input) {
        await apiClient.delete("/auth/account", input);
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
