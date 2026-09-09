import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatMileage } from "@/lib/formatters";
import type {
  MaintenanceReminder,
  ServiceRecord,
  Vehicle,
} from "@/types/api-types";

type ServiceForm = {
  serviceDate: string;
  mileage: string;
  serviceType: string;
  operations: string;
  replacedParts: string;
  description: string;
};
type ReminderForm = {
  title: string;
  dueDate: string;
  dueMileage: string;
  notes: string;
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
const otherServiceType = "Diğer";

export default function VehicleDetail() {
  const { id = "" } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [deleting, setDeleting] = useState<ServiceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [serviceTypeChoice, setServiceTypeChoice] = useState("");
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
  });
  const [reminderForm, setReminderForm] = useState<ReminderForm>({
    title: "",
    dueDate: "",
    dueMileage: "",
    notes: "",
  });

  const load = useCallback(async () => {
    try {
      const [vehicleResponse, recordsResponse, remindersResponse] = await Promise.all([
        apiClient.get<{ data: Vehicle }>(`/vehicles/${id}`),
        apiClient.get<{ data: ServiceRecord[] }>(
          `/vehicles/${id}/service-records`,
        ),
        apiClient.get<{ data: MaintenanceReminder[] }>(
          `/vehicles/${id}/reminders`,
        ),
      ]);
      setVehicle(vehicleResponse.data);
      setRecords(recordsResponse.data);
      setReminders(remindersResponse.data);
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
    setServiceTypeChoice("");
    setForm({
      serviceDate: today,
      mileage: vehicle?.currentMileage.toString() ?? "",
      serviceType: "",
      operations: "",
      replacedParts: "",
      description: "",
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
    if (!form.serviceType.trim()) {
      setError("Lütfen bir işlem türü seçin veya diğer işlem türünü yazın");
      setSaving(false);
      return;
    }
    try {
      await apiClient.post(`/vehicles/${id}/service-records`, {
        serviceDate: form.serviceDate,
        mileage: Number(form.mileage),
        serviceType: form.serviceType,
        operations: lines(form.operations),
        replacedParts: lines(form.replacedParts),
        description: form.description || null,
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
  const openReminder = () => {
    setError("");
    setReminderForm({ title: "", dueDate: "", dueMileage: "", notes: "" });
    setReminderDialogOpen(true);
  };
  const saveReminder = async (event: FormEvent) => {
    event.preventDefault();
    if (!reminderForm.dueDate && !reminderForm.dueMileage) {
      setError("Hatırlatıcı için tarih veya kilometre girin");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiClient.post(`/vehicles/${id}/reminders`, {
        title: reminderForm.title,
        dueDate: reminderForm.dueDate || null,
        dueMileage: reminderForm.dueMileage
          ? Number(reminderForm.dueMileage)
          : null,
        notes: reminderForm.notes || null,
      });
      setReminderDialogOpen(false);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Hatırlatıcı oluşturulamadı");
    } finally {
      setSaving(false);
    }
  };
  const setReminderStatus = async (
    reminderId: string,
    status: "completed" | "cancelled",
  ) => {
    try {
      await apiClient.patch(`/reminders/${reminderId}`, { status });
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Hatırlatıcı güncellenemedi");
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
      {error && !dialogOpen && !reminderDialogOpen && (
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
        <div className="space-y-8">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">Bakım hatırlatmaları</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Servis geçmişinden bağımsız planlar
                </p>
              </div>
              <Button size="sm" onClick={openReminder}>
                <Plus />
                Hatırlatıcı ekle
              </Button>
            </div>
            <div className="divide-y divide-border px-5 sm:px-7">
              {reminders.length === 0 ? (
                <p className="py-7 text-sm text-muted-foreground">
                  Bu araç için bir hatırlatıcı oluşturulmamış.
                </p>
              ) : (
                reminders.map((reminder) => {
                  const overdue =
                    reminder.status === "active" &&
                    Boolean(
                      (reminder.dueDate && reminder.dueDate < today) ||
                        (reminder.dueMileage != null &&
                          reminder.dueMileage <= vehicle.currentMileage),
                    );
                  return (
                    <div key={reminder.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-md ${
                          overdue
                            ? "bg-destructive/10 text-destructive"
                            : reminder.status === "active"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {overdue ? <AlertTriangle className="size-4" /> : <CalendarClock className="size-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{reminder.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[
                            reminder.dueDate ? formatDate(reminder.dueDate) : null,
                            reminder.dueMileage != null ? formatMileage(reminder.dueMileage) : null,
                            reminder.status === "completed"
                              ? "Tamamlandı"
                              : reminder.status === "cancelled"
                                ? "İptal edildi"
                                : overdue
                                  ? "Tarihi geçti"
                                  : "Aktif",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {reminder.notes && (
                          <p className="mt-2 text-xs leading-5 text-muted-foreground">{reminder.notes}</p>
                        )}
                      </div>
                      {reminder.status === "active" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void setReminderStatus(reminder.id, "completed")}
                          >
                            <Check /> Tamamla
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void setReminderStatus(reminder.id, "cancelled")}
                          >
                            İptal
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
          <section className="panel">
          <div className="panel-heading">
            <h2 className="panel-title">İşlem geçmişi</h2>
            <span className="text-[11px] text-muted-foreground">
              En yeniden eskiye
            </span>
          </div>
          <div className="p-5 sm:p-7">
            <ServiceHistory
              records={records}
              onRemove={setDeleting}
              collapsible
            />
          </div>
          </section>
        </div>
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
                <Select
                  value={serviceTypeChoice}
                  onValueChange={(value) => {
                    const selected = value ?? "";
                    setServiceTypeChoice(selected);
                    setForm({
                      ...form,
                      serviceType:
                        selected === otherServiceType ? "" : selected,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="İşlem türünü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                  {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                  ))}
                    <SelectItem value={otherServiceType}>Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            {serviceTypeChoice === otherServiceType && (
              <FormField label="Diğer işlem türü" required>
                <Input
                  value={form.serviceType}
                  maxLength={100}
                  placeholder="Örn. Egzoz sistemi onarımı"
                  onChange={(event) =>
                    setForm({ ...form, serviceType: event.target.value })
                  }
                  required
                  autoFocus
                />
              </FormField>
            )}
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
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hatırlatıcı oluştur</DialogTitle>
            <DialogDescription>
              {vehicle.plate} için gelecekte hatırlatılacak bağımsız bir plan ekleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveReminder} className="grid gap-5">
            {error && (
              <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <FormField label="Hatırlatma başlığı" required>
              <Input
                value={reminderForm.title}
                maxLength={120}
                placeholder="Örn. Yağ bakımını kontrol et"
                onChange={(event) =>
                  setReminderForm({ ...reminderForm, title: event.target.value })
                }
                required
                autoFocus
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Hatırlatma tarihi">
                <Input
                  type="date"
                  min={today}
                  value={reminderForm.dueDate}
                  onChange={(event) =>
                    setReminderForm({ ...reminderForm, dueDate: event.target.value })
                  }
                />
              </FormField>
              <FormField label="Hedef kilometre">
                <Input
                  type="number"
                  min={vehicle.currentMileage + 1}
                  value={reminderForm.dueMileage}
                  placeholder={String(vehicle.currentMileage + 10_000)}
                  onChange={(event) =>
                    setReminderForm({ ...reminderForm, dueMileage: event.target.value })
                  }
                />
              </FormField>
            </div>
            <p className="-mt-3 text-xs text-muted-foreground">
              Tarih veya kilometreden en az birini girin.
            </p>
            <FormField label="Not">
              <Textarea
                value={reminderForm.notes}
                placeholder="Hatırlatmayla ilgili ek bilgi..."
                onChange={(event) =>
                  setReminderForm({ ...reminderForm, notes: event.target.value })
                }
              />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReminderDialogOpen(false)}>
                Vazgeç
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Hatırlatıcı oluştur"}
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
