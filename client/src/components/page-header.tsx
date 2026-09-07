import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
      <div><h1 className="text-2xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-[28px]">{title}</h1><p className="mt-1.5 text-sm text-slate-500">{description}</p></div>
      {action}
    </div>
  );
}
