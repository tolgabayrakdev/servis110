import { ArrowRight, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-state";
import { apiClient } from "@/lib/api-client";

export default function VerifyEmail() {
  const { user, verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") ?? "";
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await verifyEmail({ email, code: String(data.get("code")) });
      navigate("/dashboard", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kod doğrulanamadı");
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError("");
    setMessage("");
    try {
      const response = await apiClient.post<{ data: { message: string } }>(
        "/auth/resend-verification",
        { email },
      );
      setMessage(response.data.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kod gönderilemedi");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7">
        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-5" />
        </div>
        <h1 className="font-sans text-3xl font-semibold leading-tight tracking-[-0.035em]">
          E-postanızı doğrulayın.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          <span className="font-medium text-foreground">{email || "E-posta adresinize"}</span>{" "}
          gönderdiğimiz 6 haneli kodu girin. Kod 10 dakika geçerlidir.
        </p>
      </div>
      {email ? (
        <form onSubmit={submit} className="grid gap-5">
          <FormField label="Doğrulama kodu" htmlFor="code" required>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              minLength={6}
              maxLength={6}
              placeholder="000000"
              className="h-12 text-center text-xl tracking-[0.35em]"
              required
              autoFocus
            />
          </FormField>
          {message && (
            <div className="rounded-md bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
              {error}
            </div>
          )}
          <Button type="submit" disabled={submitting} className="h-11">
            {submitting ? "Doğrulanıyor..." : "Hesabı doğrula"}
            <ArrowRight />
          </Button>
          <Button type="button" variant="outline" disabled={resending} onClick={resend}>
            {resending ? "Gönderiliyor..." : "Yeni kod gönder"}
          </Button>
        </form>
      ) : (
        <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
          E-posta adresi eksik. Lütfen yeniden giriş yapın.
        </div>
      )}
      <Link to="/login" className="mt-7 block text-center text-sm font-semibold text-primary hover:underline">
        Giriş ekranına dön
      </Link>
    </AuthShell>
  );
}
