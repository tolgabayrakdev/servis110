import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  Plus,
  QrCode,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Link, useParams } from "react-router";
import { ErrorState, LoadingState } from "@/components/data-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { ServiceHistory } from "@/components/service-history";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatMileage } from "@/lib/formatters";
import type { ServiceRecord, Vehicle } from "@/types/api-types";

type ServiceForm = {
  serviceDate: string;
  mileage: string;
  serviceType: string;
  operations: string;
  replacedParts: string;
  description: string;
  nextServiceDate: string;
  nextServiceMileage: string;
};
const today = new Date().toISOString().slice(0, 10);
const serviceTypes = [
  "Periyodik bakım",
  "Yağ ve filtre değişimi",
  "Lastik onarımı / değişimi",
  "Arıza tespiti",
  "Mekanik onarım",
  "Elektrik / elektronik",
  "Fren sistemi",
  "Klima bakımı",
  "Kaporta / boya",
  "Muayene hazırlığı",
];

export default function VehicleDetail() {
  const { id = "" } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [deleting, setDeleting] = useState<ServiceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(vehicle!.serviceCardUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };
  const [form, setForm] = useState<ServiceForm>({
    serviceDate: today,
    mileage: "",
    serviceType: "",
    operations: "",
    replacedParts: "",
    description: "",
    nextServiceDate: "",
    nextServiceMileage: "",
  });

  const load = useCallback(async () => {
    try {
      const [vehicleResponse, recordsResponse] = await Promise.all([
        apiClient.get<{ data: Vehicle }>(`/vehicles/${id}`),
        apiClient.get<{ data: ServiceRecord[] }>(
          `/vehicles/${id}/service-records`,
        ),
      ]);
      setVehicle(vehicleResponse.data);
      setRecords(recordsResponse.data);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Araç bilgileri yüklenemedi",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- araç kimliği değiştiğinde kayıtlar API'den yüklenir
    void load();
  }, [load]);

  const openService = () => {
    setError("");
    setForm({
      serviceDate: today,
      mileage: vehicle?.currentMileage.toString() ?? "",
      serviceType: "",
      operations: "",
      replacedParts: "",
      description: "",
      nextServiceDate: "",
      nextServiceMileage: "",
    });
    setDialogOpen(true);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const lines = (value: string) =>
      value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    try {
      await apiClient.post(`/vehicles/${id}/service-records`, {
        serviceDate: form.serviceDate,
        mileage: Number(form.mileage),
        serviceType: form.serviceType,
        operations: lines(form.operations),
        replacedParts: lines(form.replacedParts),
        description: form.description || null,
        nextServiceDate: form.nextServiceDate || null,
        nextServiceMileage: form.nextServiceMileage
          ? Number(form.nextServiceMileage)
          : null,
      });
      setDialogOpen(false);
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Servis kaydı oluşturulamadı",
      );
    } finally {
      setSaving(false);
    }
  };
  const removeRecord = async () => {
    if (!deleting) return;
    try {
      await apiClient.delete(`/service-records/${deleting.id}`);
      setDeleting(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kayıt silinemedi");
    }
  };

  if (loading) return <LoadingState />;
  if (error && !vehicle) return <ErrorState message={error} retry={load} />;
  if (!vehicle) return null;

  return (
    <>
      <Link
        to="/vehicles"
        className="mb-7 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Araç kayıtlarına dön
      </Link>
      {error && !dialogOpen && (
        <p
          role="alert"
          className="mb-5 rounded-md bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <div className="page-heading">
        <div>
          <p className="eyebrow mb-3">Araç dosyası</p>
          <h1 className="display-title">{vehicle.plate}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {vehicle.brand} {vehicle.model}
            {vehicle.year ? ` · ${vehicle.year}` : ""}
          </p>
        </div>
        <Button onClick={openService}>
          <Plus />
          Servis kaydı oluştur
        </Button>
      </div>
      <div className="mb-10 grid grid-cols-1 border-y border-border py-1 sm:grid-cols-3">
        {[
          ["Araç sahibi", vehicle.customerName],
          ["Güncel kilometre", formatMileage(vehicle.currentMileage)],
          ["Servis geçmişi", `${records.length} işlem`],
        ].map(([label, value]) => (
          <div key={label} className="py-5 sm:px-5 sm:first:pl-0">
            <p className="eyebrow mb-2">{label}</p>
            <p className="text-lg font-medium tracking-tight">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <section className="panel">
          <div className="panel-heading">
            <h2 className="panel-title">İşlem geçmişi</h2>
            <span className="text-[11px] text-muted-foreground">
              En yeniden eskiye
            </span>
          </div>
          <div className="p-5 sm:p-7">
            <ServiceHistory records={records} onRemove={setDeleting} />
          </div>
        </section>
        <aside className="space-y-7">
          <div className="rounded-md border border-border bg-accent/40 p-6">
            <QrCode className="mb-5 size-5 text-muted-foreground" />
            <h2 className="font-display text-2xl">Dijital servis karnesi</h2>
            <p className="mb-5 mt-2 text-xs leading-5 text-muted-foreground">
              Müşteriniz, aracına ait kayıtları bu kod üzerinden inceleyebilir.
            </p>
            <div className="mx-auto w-fit rounded-md bg-white p-4">
              <QRCode
                value={vehicle.serviceCardUrl}
                size={160}
                fgColor="#262626"
                bgColor="#ffffff"
              />
            </div>
            <Button
              variant="outline"
              className="mt-5 w-full"
              onClick={copyLink}
            >
              {copyState === "copied" ? <Check /> : <Copy />}
              {copyState === "copied" ? "Kopyalandı" : "Bağlantıyı kopyala"}
            </Button>
            {copyState === "failed" && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                Kopyalanamadı. Karneyi açarak adresi kopyalayabilirsiniz.
              </p>
            )}
            <Link
              to={`/service-card/${vehicle.publicToken}`}
              className="mt-4 flex items-center justify-center gap-2 text-xs font-medium"
            >
              Karneyi görüntüle
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="border-t border-border pt-5">
            <p className="eyebrow mb-3">Müşteri iletişim</p>
            <p className="text-sm font-medium">{vehicle.customerName}</p>
            {vehicle.customerPhone ? (
              <a
                href={`tel:${vehicle.customerPhone}`}
                className="mt-2 inline-block text-xs text-muted-foreground underline underline-offset-4"
              >
                {vehicle.customerPhone}
              </a>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Telefon belirtilmedi
              </p>
            )}
          </div>
        </aside>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni servis kaydı</DialogTitle>
            <DialogDescription>
              {vehicle.plate} · {vehicle.brand} {vehicle.model} için yapılan
              işlemleri kaydedin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-5">
            {error && (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Servis tarihi" required>
                <Input
                  type="date"
                  value={form.serviceDate}
                  onChange={(e) =>
                    setForm({ ...form, serviceDate: e.target.value })
                  }
                  required
                />
              </FormField>
              <FormField label="Kilometre" required>
                <Input
                  type="number"
                  min="0"
                  value={form.mileage}
                  onChange={(e) =>
                    setForm({ ...form, mileage: e.target.value })
                  }
                  required
                />
              </FormField>
              <FormField label="İşlem türü" required>
                <Input
                  list="service-type-options"
                  value={form.serviceType}
                  placeholder="Seçin veya yazın"
                  onChange={(e) =>
                    setForm({ ...form, serviceType: e.target.value })
                  }
                  required
                />
                <datalist id="service-type-options">
                  {serviceTypes.map((type) => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Yapılan işlemler">
                <Textarea
                  value={form.operations}
                  onChange={(e) =>
                    setForm({ ...form, operations: e.target.value })
                  }
                  placeholder={
                    "Her satıra bir işlem\nMotor yağı değişimi\nFiltre kontrolü"
                  }
                />
              </FormField>
              <FormField label="Değiştirilen parçalar">
                <Textarea
                  value={form.replacedParts}
                  onChange={(e) =>
                    setForm({ ...form, replacedParts: e.target.value })
                  }
                  placeholder={
                    "Her satıra bir parça\nYağ filtresi\nPolen filtresi"
                  }
                />
              </FormField>
            </div>
            <FormField label="Açıklama">
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="İşlemle ilgili ek notlar..."
              />
            </FormField>
            <div className="form-section">
              <p className="text-sm font-medium">
                Sonraki bakım{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  · İsteğe bağlı
                </span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Sonraki bakım tarihi">
                  <Input
                    type="date"
                    min={form.serviceDate}
                    value={form.nextServiceDate}
                    onChange={(e) =>
                      setForm({ ...form, nextServiceDate: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Sonraki bakım kilometresi">
                  <Input
                    type="number"
                    min={Number(form.mileage) + 1 || 0}
                    value={form.nextServiceMileage}
                    onChange={(e) =>
                      setForm({ ...form, nextServiceMileage: e.target.value })
                    }
                  />
                </FormField>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Servis kaydını oluştur"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Servis kaydı silinsin mi?"
        description={`${deleting ? formatDate(deleting.serviceDate) : "Seçili tarih"} tarihli servis kaydı kalıcı olarak silinecek.`}
        onConfirm={removeRecord}
      />
    </>
  );
}
