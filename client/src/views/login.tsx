import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-state";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await login({
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      navigate("/dashboard", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Giriş yapılamadı");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7">
        <h1 className="font-sans text-3xl font-semibold leading-tight tracking-[-0.035em]">
          Tekrar hoş geldiniz.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Kaldığınız yerden devam etmek için giriş yapın.
        </p>
      </div>
      <form onSubmit={submit} className="grid gap-5">
        <FormField label="E-posta adresi" htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="servis@ornek.com"
            className="h-11"
            required
          />
        </FormField>
        <FormField label="Parola" htmlFor="password" required>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Parolanız"
              className="h-11 pr-10"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </FormField>
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
            {error}
          </div>
        )}
        <Button type="submit" disabled={submitting} className="h-11 ">
          {submitting ? "Giriş yapılıyor..." : "Giriş yap"}
          <ArrowRight />
        </Button>
      </form>
      <div className="mt-8 border-t border-border pt-6">
        <p className="text-center text-sm text-muted-foreground">
          Henüz hesabınız yok mu?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:underline"
          >
            Hesap oluşturun
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
