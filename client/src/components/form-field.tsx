import type { ReactNode } from "react";
import { Label } from "./ui/label";

export function FormField({ label, htmlFor, required, children }: { label: string; htmlFor?: string; required?: boolean; children: ReactNode }) {
  return <div className="grid gap-2"><Label htmlFor={htmlFor}>{label}{required && <span className="text-red-500">*</span>}</Label>{children}</div>;
}
