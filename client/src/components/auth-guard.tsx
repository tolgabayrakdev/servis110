import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/contexts/auth-state";
import { BrandMark } from "./brand-mark";

export function AuthGuard() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted">
        <div className="flex flex-col items-center gap-5">
          <BrandMark />
          <div className="h-1 w-28 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
