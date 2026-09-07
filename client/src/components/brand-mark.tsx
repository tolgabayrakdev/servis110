import { CarFront } from "lucide-react";

export function BrandMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-9 place-items-center rounded-md bg-blue-700 text-white">
        <CarFront className="size-[18px]" strokeWidth={2.2} />
      </div>
      {!compact && (
        <div>
          <div className={`text-[17px] font-bold tracking-tight ${inverse ? "text-white" : "text-slate-950"}`}>Servis<span className={inverse ? "text-blue-300" : "text-blue-700"}>110</span></div>
          <div className={`text-[9px] font-semibold uppercase tracking-[0.18em] ${inverse ? "text-slate-400" : "text-slate-500"}`}>Servis yönetim sistemi</div>
        </div>
      )}
    </div>
  );
}
