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
    setSubmitting(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      await login({ email: String(data.get("email")), password: String(data.get("password")) });
      navigate("/dashboard", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Giriş yapılamadı");
    } finally { setSubmitting(false); }
  };

  return (
    <AuthShell>
          <div className="mb-9"><p className="eyebrow mb-3 text-blue-700">Yetkili erişimi</p><h2 className="text-[30px] font-semibold tracking-tight text-slate-950">Hesabınıza giriş yapın</h2><p className="mt-2 text-sm text-slate-500">Servis yönetim panelinize güvenli erişim sağlayın.</p></div>
          <form onSubmit={submit} className="grid gap-5" noValidate>
            <FormField label="E-posta adresi" htmlFor="email" required><Input id="email" name="email" type="email" autoComplete="email" placeholder="servis@ornek.com" className="h-11" required /></FormField>
            <FormField label="Parola" htmlFor="password" required>
              <div className="relative"><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="En az 8 karakter" className="h-11 pr-10" required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
            </FormField>
            {error && <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</div>}
            <Button type="submit" disabled={submitting} className="h-11 bg-blue-700 hover:bg-blue-800">{submitting ? "Giriş yapılıyor..." : "Giriş yap"}<ArrowRight /></Button>
          </form>
          <div className="mt-8 border-t border-slate-200 pt-6"><p className="text-center text-sm text-slate-500">Henüz hesabınız yok mu? <Link to="/register" className="font-semibold text-blue-700 hover:underline">Hesap oluşturun</Link></p></div>
    </AuthShell>
  );
}
