import type { ReactNode } from "react";
import { AlertCircle, Inbox } from "lucide-react";

export function LoadingState() {
  return <div className="grid min-h-64 place-items-center" role="status" aria-label="Yükleniyor"><div className="size-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" /></div>;
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-white p-8 text-center"><div className="grid size-11 place-items-center rounded-full bg-red-50"><AlertCircle className="size-5 text-red-600" /></div><p className="text-sm font-medium text-red-700">{message}</p>{retry && <button onClick={retry} className="text-sm font-semibold text-red-700 underline underline-offset-4">Tekrar dene</button>}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/60 p-8 text-center"><div className="mb-4 grid size-11 place-items-center rounded-lg border border-slate-200 bg-white shadow-sm"><Inbox className="size-5 text-slate-400" /></div><p className="font-semibold text-slate-800">{title}</p><p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}
