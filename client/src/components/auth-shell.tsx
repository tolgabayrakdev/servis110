import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { ModeToggle } from "./mode-toggle";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[42%_58%]">
      <section className="relative hidden overflow-hidden border-r border-slate-800 bg-[#101827] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute -bottom-24 -right-8 select-none text-[260px] font-semibold leading-none tracking-[-0.1em] text-white/[0.025]">110</div>
        <div className="relative"><BrandMark inverse /></div>
        <div className="relative max-w-md">
          <div className="mb-7 h-px w-10 bg-blue-400" />
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">Servis operasyon platformu</p>
          <h1 className="text-4xl font-medium leading-[1.16] tracking-[-0.035em] xl:text-[48px]">Servis yönetiminin<br />yeni standardı.</h1>
          <p className="mt-6 max-w-sm text-sm leading-6 text-slate-400">Müşteri, araç ve bakım süreçleriniz için sade ve güvenilir bir çalışma alanı.</p>
        </div>
        <div className="relative flex items-center justify-between text-xs text-slate-600"><span>© 2026 Servis110</span><span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" />Güvenli erişim</span></div>
      </section>
      <section className="relative flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-10 lg:px-16">
        <div className="absolute inset-x-0 top-0 h-1 bg-blue-700 lg:hidden" />
        <div className="absolute right-5 top-5 sm:right-8 sm:top-8"><ModeToggle /></div>
        <div className="w-full max-w-[420px]">
          <div className="mb-12 lg:hidden"><BrandMark /></div>
          {children}
        </div>
      </section>
    </main>
  );
}
