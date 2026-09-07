import type { ComponentProps } from "react";
import { cn } from "cn";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/10",
        className,
      )}
      {...props}
    />
  );
}
