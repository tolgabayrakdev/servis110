import type { ReactNode } from "react";
import { NavLink, Link } from "react-router";
import { LockKeyhole } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { ModeToggle } from "./mode-toggle";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-10">
        <Link to="/login">
          <BrandMark />
        </Link>
        <div className="flex items-center gap-5">
          <span className="eyebrow hidden sm:inline">
            Dijital servis yönetimi
          </span>
          <ModeToggle />
        </div>
      </header>
      <main className="auth-content">
        <div className="mb-7 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-px w-6 bg-border" />
          Çalışma alanınız
          <span className="h-px w-6 bg-border" />
        </div>
        <div className="auth-form-panel">
          <nav className="auth-tabs" aria-label="Hesap işlemleri">
            <NavLink to="/login" className="auth-tab">
              Giriş yap
            </NavLink>
            <NavLink to="/register" className="auth-tab">
              Hesap oluştur
            </NavLink>
          </nav>
          {children}
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="size-3.5" />
          Size ve ekibinize ait bir çalışma alanı.
        </p>
      </main>
      <footer className="flex flex-wrap justify-between gap-3 px-5 py-6 text-[11px] text-muted-foreground sm:px-10">
        <span>© {new Date().getFullYear()} Servis110</span>
        <span>Müşteri. Araç. Servis.</span>
      </footer>
    </div>
  );
}
