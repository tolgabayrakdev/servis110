import { ArrowLeft, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";

export default function ForgotPassword() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await apiClient.post<{ data: { message: string } }>(
        "/auth/forgot-password",
        { email: String(data.get("email")) },
      );
      setMessage(response.data.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "İşlem tamamlanamadı");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7">
        <h1 className="font-sans text-3xl font-semibold leading-tight tracking-[-0.035em]">
          Parolanızı sıfırlayın.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          E-posta adresinizi yazın. Hesabınız varsa 15 dakika geçerli bir
          bağlantı göndereceğiz.
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
          <Mail />
          {submitting ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
        </Button>
      </form>
      <Link
        to="/login"
        className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Girişe dön
      </Link>
    </AuthShell>
  );
}
