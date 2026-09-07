import { Calendar, CarFront, CheckCircle2, Gauge, ShieldCheck, Wrench } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { BrandMark } from "@/components/brand-mark";
import { ModeToggle } from "@/components/mode-toggle";
import { ErrorState, LoadingState } from "@/components/data-state";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatMileage } from "@/lib/formatters";
import type { ServiceRecord } from "@/types/api-types";

type PublicVehicle = { id: string; plate: string; brand: string; model: string; year?: number | null; currentMileage: number; workshopName: string };
type PublicCardData = { vehicle: PublicVehicle; serviceHistory: ServiceRecord[] };

export default function ServiceCard() {
  const { token = "" } = useParams();
  const [data, setData] = useState<PublicCardData | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const response = await apiClient.get<{ data: PublicCardData }>(`/public/service-cards/${token}`);
      setData(response.data); setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Servis karnesi yüklenemedi"); }
  }, [token]);
  // oxlint-disable-next-line react/set-state-in-effect -- public kart token değiştiğinde yeniden yüklenir
  useEffect(() => { void load(); }, [load]);

  if (error) return <div className="min-h-screen bg-slate-50 px-5 pt-20"><div className="mx-auto max-w-xl"><div className="mb-10 flex justify-center"><BrandMark /></div><ErrorState message={error} retry={load} /></div></div>;
  if (!data) return <div className="min-h-screen bg-slate-50"><LoadingState /></div>;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-12">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4"><BrandMark /><div className="ml-auto flex items-center gap-1.5 border-l border-slate-200 pl-3 text-xs font-semibold text-blue-700"><ShieldCheck className="size-4" /><span className="hidden sm:inline">Doğrulanmış kayıt</span></div><ModeToggle /></div></header>
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-10">
        <section className="overflow-hidden rounded-[3px] bg-slate-900 text-white">
          <div className="relative p-6 sm:p-8"><div className="relative flex items-start gap-4"><div className="grid size-12 place-items-center border border-white/15 bg-white/[0.04]"><CarFront className="size-6 text-blue-300" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Dijital servis karnesi</p><h1 className="mt-2 font-mono text-3xl font-black tracking-wider">{data.vehicle.plate}</h1><p className="mt-1 text-sm text-slate-400">{data.vehicle.brand} {data.vehicle.model} {data.vehicle.year && `· ${data.vehicle.year}`}</p></div></div></div>
          <div className="grid grid-cols-2 border-t border-white/10 bg-white/[0.03]"><div className="border-r border-white/10 p-4 sm:px-8"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Güncel kilometre</p><p className="mt-1 font-semibold">{formatMileage(data.vehicle.currentMileage)}</p></div><div className="p-4 sm:px-8"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Kayıtlı servis</p><p className="mt-1 truncate font-semibold">{data.vehicle.workshopName}</p></div></div>
        </section>

        <div className="mb-5 mt-8 flex items-end justify-between"><div><h2 className="text-lg font-bold text-slate-950">Servis geçmişi</h2><p className="mt-1 text-xs text-slate-500">Araca uygulanan kayıtlı işlemler</p></div><span className="text-xs font-semibold text-slate-400">{data.serviceHistory.length} kayıt</span></div>
        {data.serviceHistory.length === 0 ? <div className="rounded-[3px] border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Henüz servis kaydı bulunmuyor.</div> : (
          <div className="overflow-hidden rounded-[3px] border border-slate-200 bg-white">{data.serviceHistory.map((record) => <article key={record.id} className="border-b border-slate-200 p-5 last:border-0"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center border border-slate-200 bg-slate-50 text-slate-600"><Wrench className="size-4" /></div><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{record.serviceType}</h3><div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-400"><span className="flex items-center gap-1"><Calendar className="size-3.5" />{formatDate(record.serviceDate)}</span><span className="flex items-center gap-1"><Gauge className="size-3.5" />{formatMileage(record.mileage)}</span></div></div></div>
            {(record.operations.length > 0 || record.replacedParts.length > 0) && <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">{record.operations.length > 0 && <div><p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Yapılan işlemler</p><ul className="grid gap-1.5">{record.operations.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-600"><span className="mt-2 size-1 shrink-0 rounded-full bg-blue-700" />{item}</li>)}</ul></div>}{record.replacedParts.length > 0 && <div><p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Değişen parçalar</p><ul className="grid gap-1.5">{record.replacedParts.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-600"><span className="mt-2 size-1 shrink-0 rounded-full bg-slate-400" />{item}</li>)}</ul></div>}</div>}
            {record.description && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{record.description}</p>}
            {(record.nextServiceDate || record.nextServiceMileage) && <div className="mt-4 flex flex-wrap gap-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"><strong>Sonraki bakım:</strong>{record.nextServiceDate && <span>{formatDate(record.nextServiceDate)}</span>}{record.nextServiceMileage && <span>{formatMileage(record.nextServiceMileage)}</span>}</div>}
          </article>)}</div>
        )}
        <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400"><CheckCircle2 className="size-4 shrink-0 text-blue-700" />Bu kayıt {data.vehicle.workshopName} tarafından tutulmaktadır.</div>
      </main>
    </div>
  );
}
