import { ArrowLeft, Home, MapPinOff } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { BrandMark } from "@/components/brand-mark";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-state";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const home = user ? "/dashboard" : "/login";

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-5 py-12">
      <div className="absolute inset-x-0 top-0 h-1 bg-blue-700" />
      <div className="absolute right-5 top-5 sm:right-8 sm:top-8"><ModeToggle /></div>
      <div className="w-full max-w-xl text-center">
        <div className="mb-12 flex justify-center"><BrandMark /></div>
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-[3px] border border-slate-200 bg-white text-slate-700">
          <MapPinOff className="size-7" />
        </div>
        <p className="eyebrow mb-3">Hata kodu · 404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Aradığınız sayfa bulunamadı</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">Adres değişmiş, kaldırılmış veya hatalı yazılmış olabilir. Ana ekrana dönebilir ya da önceki sayfaya geçebilirsiniz.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" size="lg" onClick={() => navigate(-1)}><ArrowLeft />Önceki sayfa</Button>
          <Button size="lg" render={<Link to={home} />}><Home />{user ? "Genel bakışa dön" : "Giriş sayfasına dön"}</Button>
        </div>
        <p className="mt-14 text-xs text-slate-400">Yardıma ihtiyacınız varsa servis yöneticinizle iletişime geçin.</p>
      </div>
    </main>
  );
}
