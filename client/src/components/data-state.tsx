import type { ReactNode } from "react";
import { AlertCircle, LoaderCircle, FolderOpen, RotateCw } from "lucide-react";
import { Button } from "./ui/button";

export function LoadingState() {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center gap-4"
      role="status"
    >
      <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      <p className="text-xs text-muted-foreground">Kayıtlar hazırlanıyor…</p>
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="panel flex min-h-64 flex-col items-center justify-center gap-4 p-7 text-center"
    >
      <AlertCircle className="size-6 text-destructive" />
      <h2 className="font-display text-2xl">İşlem tamamlanamadı.</h2>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry}>
          <RotateCw />
          Tekrar dene
        </Button>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-border bg-card p-8 text-center">
      <FolderOpen className="mb-5 size-6 text-muted-foreground" />
      <h2 className="font-display text-2xl tracking-tight">{title}</h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
