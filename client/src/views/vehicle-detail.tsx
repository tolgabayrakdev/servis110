import { ArrowLeft, Calendar, CarFront, Gauge, History, Plus, QrCode, Trash2, UserRound, Wrench } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Link, useParams } from "react-router";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatMileage } from "@/lib/formatters";
import type { ServiceRecord, Vehicle } from "@/types/api-types";

type ServiceForm = { serviceDate: string; mileage: string; serviceType: string; operations: string; replacedParts: string; description: string; nextServiceDate: string; nextServiceMileage: string };
const today = new Date().toISOString().slice(0, 10);

export default function VehicleDetail() {
  const { id = "" } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [deleting, setDeleting] = useState<ServiceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ServiceForm>({ serviceDate: today, mileage: "", serviceType: "Periyodik bakım", operations: "", replacedParts: "", description: "", nextServiceDate: "", nextServiceMileage: "" });

  const load = useCallback(async () => {
    try {
      const [vehicleResponse, recordsResponse] = await Promise.all([
        apiClient.get<{ data: Vehicle }>(`/vehicles/${id}`),
        apiClient.get<{ data: ServiceRecord[] }>(`/vehicles/${id}/service-records`),
      ]);
      setVehicle(vehicleResponse.data); setRecords(recordsResponse.data); setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Araç bilgileri yüklenemedi"); }
    finally { setLoading(false); }
  }, [id]);
  // oxlint-disable-next-line react/set-state-in-effect -- araç kimliği değiştiğinde kayıtlar API'den yüklenir
  useEffect(() => { void load(); }, [load]);

  const openService = () => {
    setForm({ serviceDate: today, mileage: vehicle?.currentMileage.toString() ?? "", serviceType: "Periyodik bakım", operations: "", replacedParts: "", description: "", nextServiceDate: "", nextServiceMileage: "" });
    setDialogOpen(true);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    const lines = (value: string) => value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
    try {
      await apiClient.post(`/vehicles/${id}/service-records`, { serviceDate: form.serviceDate, mileage: Number(form.mileage), serviceType: form.serviceType, operations: lines(form.operations), replacedParts: lines(form.replacedParts), description: form.description || null, nextServiceDate: form.nextServiceDate || null, nextServiceMileage: form.nextServiceMileage ? Number(form.nextServiceMileage) : null });
      setDialogOpen(false); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Servis kaydı oluşturulamadı"); }
    finally { setSaving(false); }
  };
  const removeRecord = async () => {
    if (!deleting) return;
    try { await apiClient.delete(`/service-records/${deleting.id}`); setDeleting(null); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Kayıt silinemedi"); }
  };

  if (loading) return <LoadingState />;
  if (error && !vehicle) return <ErrorState message={error} retry={load} />;
  if (!vehicle) return null;

  return (
    <>
      <div className="mb-5"><Link to="/vehicles" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-950"><ArrowLeft className="size-4" />Araçlara dön</Link></div>
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4"><div className="grid size-12 place-items-center rounded-[3px] bg-slate-900 text-white"><CarFront className="size-6" /></div><div><div className="flex flex-wrap items-center gap-3"><h1 className="font-mono text-2xl font-black tracking-wide text-slate-950">{vehicle.plate}</h1><span className="border-l border-slate-300 pl-3 text-[11px] font-semibold uppercase tracking-wide text-blue-700">Aktif araç</span></div><p className="mt-1 text-sm text-slate-500">{vehicle.brand} {vehicle.model} {vehicle.year && `· ${vehicle.year}`}</p></div></div>
        <Button onClick={openService} className="bg-blue-700 hover:bg-blue-800"><Plus />Yeni servis kaydı</Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <div className="min-w-0">
          <div className="mb-6 grid overflow-hidden rounded-[3px] border border-slate-200 bg-white sm:grid-cols-3">
            <div className="flex items-center gap-3 p-4"><UserRound className="size-[18px] text-slate-400" /><div className="min-w-0"><p className="text-xs text-slate-400">Araç sahibi</p><p className="truncate font-semibold">{vehicle.customerName}</p></div></div>
            <div className="flex items-center gap-3 border-t border-slate-200 p-4 sm:border-l sm:border-t-0"><Gauge className="size-[18px] text-slate-400" /><div><p className="text-xs text-slate-400">Güncel kilometre</p><p className="font-semibold">{formatMileage(vehicle.currentMileage)}</p></div></div>
            <div className="flex items-center gap-3 border-t border-slate-200 p-4 sm:border-l sm:border-t-0"><History className="size-[18px] text-slate-400" /><div><p className="text-xs text-slate-400">Toplam servis</p><p className="font-semibold">{records.length} kayıt</p></div></div>
          </div>

          <Card><CardHeader className="border-b border-slate-100"><CardTitle>Servis ve bakım geçmişi</CardTitle><p className="text-xs text-slate-400">Araca yapılan tüm işlemler, en yeniden eskiye</p></CardHeader><CardContent className="px-4 sm:px-6">
            {records.length === 0 ? <EmptyState title="Servis geçmişi boş" description="Bu araca yapılan ilk işlemi kaydedin." action={<Button onClick={openService}><Plus />Servis kaydı ekle</Button>} /> : (
              <div className="relative before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-slate-200">
                {records.map((record) => <div key={record.id} className="relative flex gap-4 pb-6 last:pb-0"><div className="z-10 grid size-9 shrink-0 place-items-center rounded-full border-4 border-white bg-slate-200 text-slate-700"><Wrench className="size-3.5" /></div><div className="min-w-0 flex-1 rounded-[3px] border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{record.serviceType}</h3><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400"><span className="flex items-center gap-1"><Calendar className="size-3.5" />{formatDate(record.serviceDate)}</span><span className="flex items-center gap-1"><Gauge className="size-3.5" />{formatMileage(record.mileage)}</span></div></div><Button variant="ghost" size="icon-sm" aria-label="Servis kaydını sil" className="text-slate-400 hover:text-red-600" onClick={() => setDeleting(record)}><Trash2 /></Button></div>
                  {(record.operations.length > 0 || record.replacedParts.length > 0) && <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">{record.operations.length > 0 && <div><p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Yapılan işlemler</p><ul className="grid gap-1.5">{record.operations.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-600"><span className="mt-2 size-1 shrink-0 rounded-full bg-blue-700" />{item}</li>)}</ul></div>}{record.replacedParts.length > 0 && <div><p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Değişen parçalar</p><ul className="grid gap-1.5">{record.replacedParts.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-600"><span className="mt-2 size-1 shrink-0 rounded-full bg-slate-400" />{item}</li>)}</ul></div>}</div>}
                  {record.description && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{record.description}</p>}
                  {(record.nextServiceDate || record.nextServiceMileage) && <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-xs"><span className="font-bold text-amber-700">Sonraki bakım</span>{record.nextServiceDate && <span className="text-amber-800">{formatDate(record.nextServiceDate)}</span>}{record.nextServiceMileage && <span className="text-amber-800">{formatMileage(record.nextServiceMileage)}</span>}</div>}
                </div></div>)}
              </div>
            )}
          </CardContent></Card>
        </div>

        <div className="space-y-5"><Card><CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="size-4 text-blue-700" />Dijital servis karnesi</CardTitle><p className="text-xs leading-5 text-slate-400">Müşteriniz QR kodu okutarak aracın servis geçmişini görüntüleyebilir.</p></CardHeader><CardContent><div className="mx-auto w-fit border border-slate-200 bg-white p-4"><QRCode value={vehicle.serviceCardUrl} size={180} fgColor="#0f172a" /></div><Button variant="outline" className="mt-4 w-full" onClick={() => navigator.clipboard.writeText(vehicle.serviceCardUrl)}>Bağlantıyı kopyala</Button></CardContent></Card>
          <Card size="sm"><CardContent><p className="text-xs font-bold uppercase tracking-wide text-slate-400">İletişim</p><p className="mt-2 font-semibold">{vehicle.customerName}</p><a href={`tel:${vehicle.customerPhone}`} className="mt-1 text-sm text-blue-700 hover:underline">{vehicle.customerPhone}</a></CardContent></Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Yeni servis kaydı</DialogTitle><DialogDescription>{vehicle.plate} · {vehicle.brand} {vehicle.model} için yapılan işlemleri kaydedin.</DialogDescription></DialogHeader>
        <form onSubmit={save} className="grid gap-5"><div className="grid gap-4 sm:grid-cols-3"><FormField label="Servis tarihi" required><Input type="date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} required /></FormField><FormField label="Kilometre" required><Input type="number" min="0" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} required /></FormField><FormField label="İşlem türü" required><Input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required /></FormField></div>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Yapılan işlemler"><Textarea value={form.operations} onChange={(e) => setForm({ ...form, operations: e.target.value })} placeholder={"Her satıra bir işlem\nMotor yağı değişimi\nFiltre kontrolü"} /></FormField><FormField label="Değiştirilen parçalar"><Textarea value={form.replacedParts} onChange={(e) => setForm({ ...form, replacedParts: e.target.value })} placeholder={"Her satıra bir parça\nYağ filtresi\nPolen filtresi"} /></FormField></div>
          <FormField label="Açıklama"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="İşlemle ilgili ek notlar..." /></FormField>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4"><p className="mb-4 text-sm font-semibold text-amber-900">Sonraki bakım hatırlatması</p><div className="grid gap-4 sm:grid-cols-2"><FormField label="Sonraki bakım tarihi"><Input type="date" min={form.serviceDate} value={form.nextServiceDate} onChange={(e) => setForm({ ...form, nextServiceDate: e.target.value })} /></FormField><FormField label="Sonraki bakım kilometresi"><Input type="number" min={Number(form.mileage) + 1 || 0} value={form.nextServiceMileage} onChange={(e) => setForm({ ...form, nextServiceMileage: e.target.value })} /></FormField></div></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Vazgeç</Button><Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">{saving ? "Kaydediliyor..." : "Servis kaydını oluştur"}</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="Servis kaydı silinsin mi?" description={`${deleting ? formatDate(deleting.serviceDate) : "Seçili tarih"} tarihli servis kaydı kalıcı olarak silinecek.`} onConfirm={removeRecord} />
    </>
  );
}
