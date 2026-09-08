import { LogoMark } from "./logo-mark";

export function BrandMark({
  compact = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-3 text-foreground"
      aria-label="Servis110"
    >
      <LogoMark className="size-10 shrink-0" />
      {!compact && (
        <span className="text-lg font-semibold tracking-[-0.05em]">
          servis<span className="font-medium text-primary">110</span>
        </span>
      )}
    </div>
  );
}
