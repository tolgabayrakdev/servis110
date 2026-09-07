import { Dialog } from "@base-ui/react/dialog";
import {
  CarFront,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Users,
  X,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const searchPlate = (event: FormEvent) => {
    event.preventDefault();
    if (plate.trim())
      navigate(`/vehicles?search=${encodeURIComponent(plate.trim())}`);
  };
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Oturum kapatılamadı. Lütfen tekrar deneyin.");
    }
  };
  const sidebarContent = (
    <>
      <div className="border-b border-border px-6 py-7">
        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
          <BrandMark />
        </Link>
      </div>
      <div className="flex-1 px-3 py-7">
        <p className="mb-4 px-3 text-xs font-medium text-muted-foreground">
          Servis yönetimi
        </p>
        <nav aria-label="Ana navigasyon" className="grid gap-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-md border-l-2 px-3 text-sm transition-colors ${isActive ? "border-foreground bg-muted font-semibold text-foreground" : "border-transparent text-secondary-foreground hover:bg-muted/60"}`
              }
            >
              <Icon className="size-[18px]" strokeWidth={1.6} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="border-t border-border px-4 py-5">
        <div className="mb-4 flex items-center gap-3 px-2">
          <span className="person-initials">
            {getInitials(user?.name ?? "S")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {user?.role === "owner" ? "İşletme yöneticisi" : "Servis ekibi"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-secondary-foreground"
          onClick={() => {
            setMenuOpen(false);
            setLogoutError("");
            setLogoutDialogOpen(true);
          }}
        >
          <LogOut />
          Oturumu kapat
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-svh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-card focus:p-3"
      >
        İçeriğe geç
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        {sidebarContent}
      </aside>
      <div className="flex min-h-svh flex-col lg:pl-60">
        <header className="border-b border-border bg-card">
          <div className="workspace-width flex min-h-20 items-center gap-3 py-3 sm:gap-6">
            <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Dialog.Trigger
                render={
                  <Button variant="outline" size="icon" className="lg:hidden" />
                }
                aria-label="Menüyü aç"
              >
                <Menu />
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/30" />
                <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card text-foreground outline-none">
                  <Dialog.Title className="sr-only">Ana menü</Dialog.Title>
                  <Dialog.Close
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-2 top-2"
                      />
                    }
                    aria-label="Menüyü kapat"
                  >
                    <X />
                  </Dialog.Close>
                  {sidebarContent}
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
            <form onSubmit={searchPlate} className="search-field flex-1">
              <Search />
              <Input
                aria-label="Plaka ile hızlı arama"
                value={plate}
                onChange={(event) => setPlate(event.target.value)}
                placeholder="Plaka ile araç ara"
                className="bg-card"
              />
            </form>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground md:inline">
                {new Intl.DateTimeFormat("tr-TR", {
                  day: "numeric",
                  month: "long",
                }).format(new Date())}
              </span>
              <ModeToggle />
            </div>
          </div>
        </header>
        <main
          id="main-content"
          className="workspace-width flex-1 py-8 sm:py-10"
        >
          <Outlet />
        </main>
        <footer className="workspace-width border-t border-border py-5 text-xs text-muted-foreground">
          Servis110 · Dijital servis yönetimi
        </footer>
      </div>
      <ConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        title="Oturum kapatılsın mı?"
        description={
          logoutError ||
          "Panelden çıkış yapacaksınız. Devam etmek için yeniden giriş yapabilirsiniz."
        }
        confirmLabel="Oturumu kapat"
        destructive={false}
        onConfirm={handleLogout}
      />
    </div>
  );
}
