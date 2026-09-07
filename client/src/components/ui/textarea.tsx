import type { ComponentProps } from "react";
import { cn } from "cn";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn("min-h-24 w-full resize-y rounded-[3px] border border-input bg-white px-3 py-2 text-sm shadow-none outline-none placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/10", className)} {...props} />;
}
