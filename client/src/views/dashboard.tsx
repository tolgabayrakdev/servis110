import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CarFront,
  Plus,
  Users,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { ErrorState, LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-state";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatMileage } from "@/lib/formatters";
import type { Dashboard, MaintenanceItem } from "@/types/api-types";

function MaintenanceRow({ item }: { item: MaintenanceItem }) {
  const overdue = item.status === "overdue";
  return (
    <Link
      to={`/vehicles/${item.vehicleId}`}
      className="flex items-center gap-3 rounded-md p-3 transition hover:bg-muted"
    >
      <div
        className={`grid size-9 shrink-0 place-items-center rounded-md ${overdue ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}
      >
        {overdue ? (
          <AlertTriangle className="size-4" />
        ) : (
          <CalendarClock className="size-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 truncate text-xs font-semibold text-foreground">
          {item.title}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-foreground">
            {item.plate}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {item.brand} {item.model}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {item.customerName}
        </p>
      </div>
      <div className="text-right text-xs">
        <p
          className={
            overdue
              ? "font-semibold text-destructive"
              : "font-semibold text-warning"
          }
        >
          {formatDate(item.nextServiceDate)}
        </p>
        <p className="mt-0.5 text-muted-foreground">
          {formatMileage(item.nextServiceMileage)}
        </p>
      </div>
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
      setData(response.data);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Dashboard yüklenemedi",
      );
    }
  }, []);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- uzak API verisi route açılışında yüklenir
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} retry={load} />;
  if (!data) return <LoadingState />;

  const stats = [
    { label: "Toplam araç", value: data.stats.totalVehicles, icon: CarFront },
    { label: "Toplam müşteri", value: data.stats.totalCustomers, icon: Users },
    {
      label: "Yaklaşan bakım",
      value: data.stats.upcomingMaintenance,
      icon: CalendarClock,
    },
    {
      label: "Geciken bakım",
      value: data.stats.overdueMaintenance,
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      <div className="mb-7 flex items-center justify-between gap-4">
        <p className="eyebrow">Çalışma alanı / Genel bakış</p>
        <p className="text-[11px] text-muted-foreground">
          {new Intl.DateTimeFormat("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date())}
        </p>
      </div>
      <PageHeader
        title={`İyi çalışmalar, ${user?.name.split(" ")[0] ?? ""}.`}
        description="Servisinizin genel görünümü. Kayıtlar, işlemler ve sıradaki bakımlar."
        action={
          <Button render={<Link to="/vehicles" />}>
            <Plus />
            Araçlara git
          </Button>
        }
      />
      <section
        aria-label="Servis istatistikleri"
        className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map(({ label, value, icon: Icon }, index) => (
          <div key={label} className="metric">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span className="metric-value">{value}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                0{index + 1}
              </span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        <Card className="gap-0 py-0">
          <div className="panel-heading">
            <div>
              <h2 className="panel-title">Son servis işlemleri</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                En son kaydedilen işlemler
              </p>
            </div>
            <Link
              to="/vehicles"
              aria-label="Tüm araçları görüntüle"
              className="rounded-md border border-border p-2"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <CardContent className="gap-0 px-0">
            {data.recentServices.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
                <Wrench className="size-6 text-muted-foreground" />
                <p className="text-sm">İlk servis kaydınızı oluşturun.</p>
                <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                  Araçlarınıza yaptığınız işlemler burada kronolojik olarak
                  listelenir.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to="/vehicles" />}
                >
                  Araçları görüntüle
                  <ArrowRight />
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Araç</th>
                      <th>Yapılan işlem</th>
                      <th className="hidden sm:table-cell">Tarih</th>
                      <th>
                        <span className="sr-only">Detay</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentServices.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <Link
                            to={`/vehicles/${record.vehicleId}`}
                            className="plate"
                          >
                            {record.plate}
                          </Link>
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            {record.brand} {record.model}
                          </p>
                        </td>
                        <td>
                          <p className="text-xs font-medium">
                            {record.serviceType}
                          </p>
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            {record.customerName}
                          </p>
                        </td>
                        <td className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">
                          {formatDate(record.serviceDate)}
                        </td>
                        <td>
                          <Link
                            to={`/vehicles/${record.vehicleId}`}
                            aria-label={`${record.plate} detayını aç`}
                          >
                            <ArrowUpRight className="size-4 text-muted-foreground" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-7">
          <section className="border-t border-foreground pt-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="panel-title">Yaklaşan hatırlatmalar</h2>
              <CalendarClock className="size-4 text-muted-foreground" />
            </div>
            {[...data.overdueMaintenance, ...data.upcomingMaintenance]
              .length === 0 ? (
              <div className="rounded-md bg-muted/60 p-6">
                <p className="font-display text-2xl">Ajandanız güncel.</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Yaklaşan veya tarihi geçen bir hatırlatma bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="-mx-3">
                {[...data.overdueMaintenance, ...data.upcomingMaintenance]
                  .slice(0, 6)
                  .map((item) => (
                    <MaintenanceRow key={item.reminderId} item={item} />
                  ))}
              </div>
            )}
            <Link
              to="/vehicles"
              className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs font-medium"
            >
              Araç kayıtlarını incele
              <ArrowRight className="size-4" />
            </Link>
          </section>
          <section className="rounded-md border border-border p-5">
            <p className="eyebrow mb-4">Hızlı erişim</p>
            <Link
              to="/customers"
              className="flex items-center justify-between py-2 text-sm"
            >
              Müşteri rehberi
              <Users className="size-4 text-muted-foreground" />
            </Link>
            <Link
              to="/vehicles"
              className="mt-2 flex items-center justify-between border-t border-border pt-4 text-sm"
            >
              Araç ve servis geçmişi
              <CarFront className="size-4 text-muted-foreground" />
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
