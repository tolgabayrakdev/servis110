import { ArrowRight } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-state";

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await register({
        workshopName: String(data.get("workshopName")),
        name: String(data.get("name")),
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      navigate("/dashboard", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Hesap oluşturulamadı",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7">
        <h1 className="font-sans text-3xl font-semibold leading-tight tracking-[-0.035em]">
          Yeni bir başlangıç.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Servisiniz için çalışma alanınızı oluşturun.
        </p>
      </div>
      <form onSubmit={submit} className="grid gap-5">
        <FormField label="Servis adı" htmlFor="workshopName" required>
          <Input
            id="workshopName"
            name="workshopName"
            placeholder="Örn. Yıldız Oto Servis"
            className="h-11"
            required
          />
        </FormField>
        <FormField label="Adınız soyadınız" htmlFor="name" required>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Ad Soyad"
            className="h-11"
            required
          />
        </FormField>
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
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            placeholder="En az 8 karakter"
            className="h-11"
            required
          />
        </FormField>
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
            {error}
          </div>
        )}
        <Button type="submit" disabled={submitting} className="mt-1 h-11 ">
          {submitting ? "Hesap oluşturuluyor..." : "Hesabı oluştur"}
          <ArrowRight />
        </Button>
      </form>
      <p className="mt-6 border-t border-border pt-5 text-center text-xs leading-5 text-muted-foreground">
        Zaten hesabınız var mı?{" "}
        <Link
          to="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Giriş yapın
        </Link>
      </p>
    </AuthShell>
  );
}
