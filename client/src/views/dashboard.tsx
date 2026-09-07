import { AlertTriangle, ArrowRight, CalendarClock, CarFront, Plus, Users, Wrench } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { ErrorState, LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-state";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatMileage } from "@/lib/formatters";
import type { Dashboard, MaintenanceItem } from "@/types/api-types";

function MaintenanceRow({ item }: { item: MaintenanceItem }) {
  const overdue = item.status === "overdue";
  return (
    <Link to={`/vehicles/${item.vehicleId}`} className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-slate-50">
      <div className={`grid size-9 shrink-0 place-items-center rounded-lg ${overdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>{overdue ? <AlertTriangle className="size-4" /> : <CalendarClock className="size-4" />}</div>
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-mono text-sm font-bold text-slate-900">{item.plate}</span><span className="truncate text-xs text-slate-400">{item.brand} {item.model}</span></div><p className="mt-0.5 truncate text-xs text-slate-500">{item.customerName}</p></div>
      <div className="text-right text-xs"><p className={overdue ? "font-semibold text-red-600" : "font-semibold text-amber-600"}>{formatDate(item.nextServiceDate)}</p><p className="mt-0.5 text-slate-400">{formatMileage(item.nextServiceMileage)}</p></div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const response = await apiClient.get<{ data: Dashboard }>("/dashboard");
      setData(response.data); setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Dashboard yüklenemedi"); }
  }, []);
  // oxlint-disable-next-line react/set-state-in-effect -- uzak API verisi route açılışında yüklenir
  useEffect(() => { void load(); }, [load]);

  if (error) return <ErrorState message={error} retry={load} />;
  if (!data) return <LoadingState />;

  const stats = [
    { label: "Toplam araç", value: data.stats.totalVehicles, icon: CarFront },
    { label: "Toplam müşteri", value: data.stats.totalCustomers, icon: Users },
    { label: "Yaklaşan bakım", value: data.stats.upcomingMaintenance, icon: CalendarClock },
    { label: "Geciken bakım", value: data.stats.overdueMaintenance, icon: AlertTriangle },
  ];

  return (
    <>
      <PageHeader title={`Merhaba, ${user?.name.split(" ")[0] ?? ""}`} description="Servisinizde bugün neler olduğuna göz atın." action={<div className="flex gap-2"><Button variant="outline" render={<Link to="/customers" />}><Users />Müşteri ekle</Button><Button className="bg-blue-700 hover:bg-blue-800" render={<Link to="/vehicles" />}><Plus />Araç ekle</Button></div>} />
      <div className="grid overflow-hidden rounded-[3px] border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }, index) => <div key={label} className={`relative min-h-32 p-5 sm:p-6 ${index === 1 ? "border-t border-slate-200 sm:border-l sm:border-t-0" : ""} ${index === 2 ? "border-t border-slate-200 xl:border-l xl:border-t-0" : ""} ${index === 3 ? "border-t border-slate-200 sm:border-l xl:border-t-0" : ""}`}><div className="flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p><Icon className="size-[18px] text-slate-400" /></div><p className="mt-6 text-[32px] font-semibold leading-none tracking-[-0.04em] text-slate-950">{value}</p></div>)}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader className="border-b border-slate-100"><CardTitle>Son servis işlemleri</CardTitle><p className="text-xs text-slate-400">En son kaydedilen 10 işlem</p></CardHeader>
          <CardContent className="gap-0 px-0">
            {data.recentServices.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">Henüz servis kaydı bulunmuyor.</div> : data.recentServices.map((record) => (
              <Link key={record.id} to={`/vehicles/${record.vehicleId}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 px-6 py-4 last:border-0 hover:bg-slate-50/70 sm:grid-cols-[150px_1fr_auto]">
                <div><span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs font-bold">{record.plate}</span><p className="mt-2 text-xs text-slate-400 sm:hidden">{formatDate(record.serviceDate)}</p></div>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{record.serviceType}</p><p className="mt-1 truncate text-xs text-slate-400">{record.customerName} · {record.brand} {record.model}</p></div>
                <div className="hidden text-right sm:block"><p className="text-xs font-medium text-slate-600">{formatDate(record.serviceDate)}</p><p className="mt-1 text-xs text-slate-400">{formatMileage(record.mileage)}</p></div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100"><CardTitle>Bakım takibi</CardTitle><p className="text-xs text-slate-400">İlginizi bekleyen araçlar</p></CardHeader>
          <CardContent className="gap-1 px-3">
            {[...data.overdueMaintenance, ...data.upcomingMaintenance].length === 0 ? <div className="py-12 text-center"><Wrench className="mx-auto mb-3 size-5 text-slate-400" /><p className="text-sm font-medium text-slate-700">Tüm bakımlar güncel</p><p className="mt-1 text-xs text-slate-400">Yaklaşan veya geciken bakım yok.</p></div> : [...data.overdueMaintenance, ...data.upcomingMaintenance].slice(0, 6).map((item) => <MaintenanceRow key={item.vehicleId} item={item} />)}
          </CardContent>
          <div className="border-t border-slate-100 px-5 pt-4"><Link to="/vehicles" className="flex items-center gap-1 text-xs font-semibold text-blue-700">Tüm araçları görüntüle <ArrowRight className="size-3" /></Link></div>
        </Card>
      </div>
    </>
  );
}
