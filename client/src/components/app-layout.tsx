import { CarFront, LayoutDashboard, LogOut, Search, Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth-state";
import { getInitials } from "@/lib/formatters";
import { BrandMark } from "./brand-mark";
import { ConfirmDialog } from "./confirm-dialog";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const navItems = [
  { to: "/dashboard", label: "Genel bakış", icon: LayoutDashboard },
  { to: "/customers", label: "Müşteriler", icon: Users },
  { to: "/vehicles", label: "Araçlar", icon: CarFront },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [plate, setPlate] = useState("");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const searchPlate = (event: FormEvent) => {
    event.preventDefault();
    if (plate.trim()) navigate(`/vehicles?search=${encodeURIComponent(plate.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-slate-900 px-4 py-5 text-white lg:flex">
        <div className="px-2"><BrandMark inverse /></div>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Operasyon</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-blue-600/20 text-white before:absolute before:-left-4 before:h-6 before:w-0.5 before:bg-blue-400" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`}>
              <Icon className="size-[18px]" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="grid size-9 place-items-center rounded-md bg-blue-600 text-xs font-bold text-white">{getInitials(user?.name ?? "S")}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{user?.name}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-white/[0.06] hover:text-white" onClick={() => setLogoutDialogOpen(true)}><LogOut />Oturumu kapat</Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex h-[68px] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden"><BrandMark compact /></div>
            <form onSubmit={searchPlate} className="relative max-w-lg flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input value={plate} onChange={(event) => setPlate(event.target.value)} aria-label="Plaka ile araç ara" className="h-10 border-slate-200 bg-slate-50 pl-9 shadow-none focus-visible:bg-white" placeholder="Plaka ile hızlı arama" />
            </form>
            <ModeToggle />
            <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 text-xs font-medium text-slate-500 sm:flex"><span className="size-2 rounded-full bg-blue-600 ring-4 ring-blue-50" />Sistem aktif</div>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8"><Outlet /></main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-20 flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? "text-blue-700" : "text-slate-400"}`}>
            <Icon className="size-5" />{label}
          </NavLink>
        ))}
        <button onClick={() => setLogoutDialogOpen(true)} className="flex min-w-16 flex-col items-center gap-1 text-[11px] font-semibold text-slate-400"><LogOut className="size-5" />Çıkış</button>
      </nav>
      <ConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        title="Oturum kapatılsın mı?"
        description="Yönetim panelinden çıkış yapacaksınız. Devam etmek için yeniden giriş yapmanız gerekir."
        confirmLabel="Oturumu kapat"
        destructive={false}
        onConfirm={handleLogout}
      />
    </div>
  );
}
