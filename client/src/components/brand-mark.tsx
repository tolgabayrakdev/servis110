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
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-md border border-foreground/70 font-mono text-[11px] font-medium tracking-[-0.1em]"
      >
        110
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-[-0.05em]">
          servis<span className="font-normal text-muted-foreground">110</span>
        </span>
      )}
    </div>
  );
}
