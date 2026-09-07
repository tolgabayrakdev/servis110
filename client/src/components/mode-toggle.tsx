import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

const options = [
  { value: "light" as const, label: "Açık", icon: Sun },
  { value: "dark" as const, label: "Koyu", icon: Moon },
  { value: "system" as const, label: "Sistem", icon: Monitor },
];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Button variant="outline" size="icon" aria-label="Görünüm temasını değiştir" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="relative bg-white dark:bg-slate-900">
        <Sun className="size-[18px] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute size-[18px] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </Button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-36 rounded-[3px] border border-slate-200 bg-white p-1 shadow-xl shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900">
          {options.map(({ value, label, icon: Icon }) => (
            <button key={value} role="menuitem" onClick={() => { setTheme(value); setOpen(false); }} className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <Icon className="size-4" /><span className="flex-1">{label}</span>{theme === value && <Check className="size-3.5 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
