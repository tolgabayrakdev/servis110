import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get("newPassword"));
    if (newPassword !== String(data.get("passwordConfirmation"))) {
      setError("Parolalar eşleşmiyor");
      setSubmitting(false);
      return;
    }
    try {
      await apiClient.post<void>("/auth/reset-password", { token, newPassword });
      setSuccess(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Parola değiştirilemedi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7">
        <h1 className="font-sans text-3xl font-semibold leading-tight tracking-[-0.035em]">
          Yeni parola oluşturun.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          En az 8 karakterden oluşan yeni parolanızı belirleyin.
        </p>
      </div>
      {success ? (
        <div className="grid gap-5">
          <div className="rounded-md bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary">
            Parolanız yenilendi. Artık yeni parolanızla giriş yapabilirsiniz.
          </div>
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Giriş yap <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-5">
          {[
            ["newPassword", "Yeni parola"],
            ["passwordConfirmation", "Yeni parola (tekrar)"],
          ].map(([name, label]) => (
            <FormField key={name} label={label} htmlFor={name} required>
              <div className="relative">
                <Input
                  id={name}
                  name={name}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  className="h-11 pr-10"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </FormField>
          ))}
          {!token && (
            <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
              Sıfırlama bağlantısı geçersiz.
            </div>
          )}
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
              {error}
            </div>
          )}
          <Button type="submit" disabled={submitting || !token} className="h-11">
            {submitting ? "Kaydediliyor..." : "Yeni parolayı kaydet"}
            <ArrowRight />
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
