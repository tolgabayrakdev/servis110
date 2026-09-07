import { Menu } from "@base-ui/react/menu";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

const options = [
  { value: "light" as const, label: "Açık", icon: Sun },
  { value: "dark" as const, label: "Koyu", icon: Moon },
  { value: "system" as const, label: "Sistem", icon: Monitor },
];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="relative rounded-md"
          />
        }
        aria-label="Görünüm temasını değiştir"
      >
        <Sun className="size-4 scale-100 transition-transform dark:scale-0" />
        <Moon className="absolute size-4 scale-0 transition-transform dark:scale-100" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="w-40 rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-lg shadow-foreground/10 outline-none">
            <p className="eyebrow px-2.5 py-2">Görünüm</p>
            <Menu.RadioGroup
              value={theme}
              onValueChange={(value) => {
                if (value === "light" || value === "dark" || value === "system")
                  setTheme(value);
              }}
            >
              {options.map(({ value, label, icon: Icon }) => (
                <Menu.RadioItem
                  key={value}
                  value={value}
                  closeOnClick
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2.5 text-xs outline-none data-highlighted:bg-muted"
                >
                  <Icon className="size-3.5 text-muted-foreground" />
                  <span className="flex-1">{label}</span>
                  <Menu.RadioItemIndicator>
                    <Check className="size-3.5" />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
