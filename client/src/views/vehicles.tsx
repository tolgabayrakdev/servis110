import { CarFront, ChevronRight, Gauge, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { EmptyState, LoadingState } from "@/components/data-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { formatMileage } from "@/lib/formatters";
import type { Customer, Paginated, Vehicle } from "@/types/api-types";

type VehicleForm = { customerId: string; plate: string; brand: string; model: string; year: string; currentMileage: string };
const emptyForm: VehicleForm = { customerId: "", plate: "", brand: "", model: "", year: "", currentMileage: "" };

export default function Vehicles() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [vehicleResponse, customerResponse] = await Promise.all([
        apiClient.get<Paginated<Vehicle>>(`/vehicles?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`),
        apiClient.get<Paginated<Customer>>("/customers?limit=100"),
      ]);
      setVehicles(vehicleResponse.data); setCustomers(customerResponse.data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Araçlar yüklenemedi"); }
    finally { setLoading(false); }
  }, [search]);
  useEffect(() => { const timer = window.setTimeout(load, 250); setParams(search ? { search } : {}, { replace: true }); return () => window.clearTimeout(timer); }, [load, search, setParams]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, customerId: customers[0]?.id ?? "" }); setDialogOpen(true); };
  const openEdit = (vehicle: Vehicle) => { setEditing(vehicle); setForm({ customerId: vehicle.customerId, plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year?.toString() ?? "", currentMileage: vehicle.currentMileage.toString() }); setDialogOpen(true); };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    const payload = { customerId: form.customerId, plate: form.plate, brand: form.brand, model: form.model, year: form.year ? Number(form.year) : null, currentMileage: Number(form.currentMileage) };
    try { if (editing) await apiClient.patch(`/vehicles/${editing.id}`, payload); else await apiClient.post("/vehicles", payload); setDialogOpen(false); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Araç kaydedilemedi"); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!deleting) return;
    try { await apiClient.delete(`/vehicles/${deleting.id}`); setDeleting(null); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Araç silinemedi"); }
  };

  return (
    <>
      <PageHeader title="Araçlar" description="Kayıtlı araçları bulun ve dijital servis geçmişine ulaşın." action={<Button onClick={openCreate} disabled={customers.length === 0} className="bg-blue-700 hover:bg-blue-800"><Plus />Yeni araç</Button>} />
      <Card className="mb-5 py-4"><CardContent className="flex-row items-center"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Plaka, marka, model veya müşteri ara..." className="pl-9" /></div>{search && <Button size="icon" variant="ghost" onClick={() => setSearch("")}><X /></Button>}<div className="ml-auto hidden text-xs font-medium text-slate-400 sm:block">{vehicles.length} araç</div></CardContent></Card>
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? <LoadingState /> : vehicles.length === 0 ? <EmptyState title={search ? "Araç bulunamadı" : "Henüz araç yok"} description={customers.length === 0 ? "Araç eklemek için önce bir müşteri oluşturun." : search ? "Farklı bir plaka veya arama ifadesi deneyin." : "İlk aracınızı ekleyerek dijital servis geçmişini oluşturmaya başlayın."} action={!search && <Button onClick={openCreate} disabled={customers.length === 0}><Plus />Araç ekle</Button>} /> : (
        <div className="overflow-hidden rounded-[3px] border border-slate-200 bg-white">
          <div className="hidden grid-cols-[140px_1.2fr_1fr_150px_90px] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 md:grid"><span>Plaka</span><span>Araç</span><span>Müşteri</span><span>Kilometre</span><span /></div>
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="group flex items-center gap-4 border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50/60 md:grid md:grid-cols-[140px_1.2fr_1fr_150px_90px] md:px-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-slate-100 md:hidden"><CarFront className="size-5 text-slate-500" /></div>
              <div><span className="inline-flex rounded-md border-2 border-slate-800 bg-white px-2.5 py-1 font-mono text-sm font-black tracking-wide text-slate-950">{vehicle.plate}</span></div>
              <div className="hidden min-w-0 md:block"><p className="truncate font-semibold text-slate-900">{vehicle.brand} {vehicle.model}</p><p className="mt-0.5 text-xs text-slate-400">{vehicle.year ?? "Yıl belirtilmedi"}</p></div>
              <div className="hidden min-w-0 md:block"><p className="truncate text-sm font-medium text-slate-700">{vehicle.customerName}</p><p className="mt-0.5 text-xs text-slate-400">{vehicle.customerPhone || "Telefon belirtilmedi"}</p></div>
              <div className="ml-auto min-w-0 md:ml-0"><p className="truncate text-sm font-semibold md:hidden">{vehicle.brand} {vehicle.model}</p><p className="mt-0.5 flex items-center justify-end gap-1 text-xs text-slate-500 md:justify-start md:text-sm"><Gauge className="size-3.5" />{formatMileage(vehicle.currentMileage)}</p></div>
              <div className="flex justify-end gap-1"><Button size="icon-sm" variant="ghost" aria-label={`${vehicle.plate} aracını düzenle`} onClick={() => openEdit(vehicle)}><UserRound /></Button><Button size="icon-sm" variant="ghost" aria-label={`${vehicle.plate} aracını sil`} onClick={() => setDeleting(vehicle)} className="hidden text-slate-400 hover:text-red-600 sm:inline-flex"><Trash2 /></Button><Button size="icon-sm" variant="ghost" aria-label={`${vehicle.plate} detayını aç`} render={<Link to={`/vehicles/${vehicle.id}`} />}><ChevronRight /></Button></div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editing ? "Aracı düzenle" : "Yeni araç"}</DialogTitle><DialogDescription>Araç ve sahip bilgilerini kaydedin.</DialogDescription></DialogHeader>
        <form onSubmit={save} className="grid gap-5"><FormField label="Araç sahibi" required><select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600" required><option value="">Müşteri seçin</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.phone ? ` · ${customer.phone}` : ""}</option>)}</select></FormField>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Plaka" required><Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toLocaleUpperCase("tr-TR") })} placeholder="34 ABC 110" required /></FormField><FormField label="Yıl"><Input type="number" min="1900" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></FormField></div>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Marka" required><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Toyota" required /></FormField><FormField label="Model" required><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Corolla" required /></FormField></div>
          <FormField label="Güncel kilometre" required><Input type="number" min="0" value={form.currentMileage} onChange={(e) => setForm({ ...form, currentMileage: e.target.value })} placeholder="125000" required /></FormField>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Vazgeç</Button><Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">{saving ? "Kaydediliyor..." : "Kaydet"}</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="Araç kaydı silinsin mi?" description={`${deleting?.plate ?? "Bu araç"} plakasına ait araç ve servis geçmişi kalıcı olarak silinecek.`} onConfirm={remove} />
    </>
  );
}
