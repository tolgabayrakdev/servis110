import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { BrandMark } from "@/components/brand-mark";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-state";

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-5 sm:px-10">
        <BrandMark />
        <ModeToggle />
      </header>
      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-6 py-12 md:grid-cols-2">
        <div
          aria-hidden="true"
          className="font-display text-[130px] leading-none tracking-[-0.1em] text-muted-foreground/30 sm:text-[200px]"
        >
          404<span className="text-foreground">.</span>
        </div>
        <div>
          <p className="eyebrow mb-5">Sayfa bulunamadı</p>
          <h1 className="display-title">
            Yolu yeniden
            <br />
            bulalım.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
            Aradığınız sayfa taşınmış veya kaldırılmış olabilir. Adresi kontrol
            edebilir ya da çalışma alanınıza dönebilirsiniz.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button render={<Link to={user ? "/dashboard" : "/login"} />}>
              {user ? "Çalışma alanına dön" : "Giriş sayfasına dön"}
              <ArrowRight />
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft />
              Geri
            </Button>
          </div>
        </div>
      </main>
      <footer className="px-6 py-6 text-xs text-muted-foreground sm:px-10">
        © {new Date().getFullYear()} Servis110
      </footer>
    </div>
  );
}
