import { FileCheck2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { BrandMark } from "@/components/brand-mark";
import { ModeToggle } from "@/components/mode-toggle";
import { ErrorState, LoadingState } from "@/components/data-state";
import { apiClient } from "@/lib/api-client";
import { ServiceHistory } from "@/components/service-history";
import { formatMileage } from "@/lib/formatters";
import type { ServiceRecord } from "@/types/api-types";

type PublicVehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  currentMileage: number;
  workshopName: string;
};
type PublicCardData = {
  vehicle: PublicVehicle;
  serviceHistory: ServiceRecord[];
};

export default function ServiceCard() {
  const { token = "" } = useParams();
  const [data, setData] = useState<PublicCardData | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const response = await apiClient.get<{ data: PublicCardData }>(
        `/public/service-cards/${token}`,
      );
      setData(response.data);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Servis karnesi yüklenemedi",
      );
    }
  }, [token]);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- public kart token değiştiğinde yeniden yüklenir
    void load();
  }, [load]);

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 sm:px-8">
          <BrandMark />
          <ModeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        {error ? (
          <ErrorState message={error} retry={load} />
        ) : !data ? (
          <LoadingState />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="eyebrow">Servis110 / Dijital araç dosyası</p>
              <FileCheck2 className="size-5 text-muted-foreground" />
            </div>
            <section className="mb-9">
              <h1 className="display-title">{data.vehicle.plate}</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {data.vehicle.brand} {data.vehicle.model}
                {data.vehicle.year ? ` · ${data.vehicle.year}` : ""}
              </p>
              <dl className="mt-8 grid grid-cols-2 gap-5 border-y border-border py-6">
                <div>
                  <dt className="eyebrow">Güncel kilometre</dt>
                  <dd className="mt-2 text-lg font-medium">
                    {formatMileage(data.vehicle.currentMileage)}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Kayıtlı servis</dt>
                  <dd className="mt-2 break-words text-lg font-medium">
                    {data.vehicle.workshopName}
                  </dd>
                </div>
              </dl>
            </section>
            <section className="panel">
              <div className="panel-heading">
                <h2 className="panel-title">Servis geçmişi</h2>
                <span className="text-xs text-muted-foreground">
                  {data.serviceHistory.length} işlem
                </span>
              </div>
              <div className="p-5 sm:p-8">
                <ServiceHistory records={data.serviceHistory} />
              </div>
            </section>
            <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">
              Bu kayıtlar {data.vehicle.workshopName} tarafından tutulmaktadır.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
