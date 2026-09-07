import { Mail, MapPin, MoreHorizontal, Phone, Plus, Search, Trash2, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { EmptyState, LoadingState } from "@/components/data-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { getInitials } from "@/lib/formatters";
import type { Customer, Paginated } from "@/types/api-types";

type CustomerForm = { name: string; phone: string; email: string; address: string; notes: string };
const emptyForm: CustomerForm = { name: "", phone: "", email: "", address: "", notes: "" };

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await apiClient.get<Paginated<Customer>>(`/customers?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`);
      setCustomers(response.data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Müşteriler yüklenemedi"); }
    finally { setLoading(false); }
  }, [search]);
  useEffect(() => { const timer = window.setTimeout(load, 250); return () => window.clearTimeout(timer); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (customer: Customer) => { setEditing(customer); setForm({ name: customer.name, phone: customer.phone ?? "", email: customer.email ?? "", address: customer.address ?? "", notes: customer.notes ?? "" }); setDialogOpen(true); };

  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      };
      if (editing) await apiClient.patch(`/customers/${editing.id}`, payload);
      else await apiClient.post("/customers", payload);
      setDialogOpen(false); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Müşteri kaydedilemedi"); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    try { await apiClient.delete(`/customers/${deleting.id}`); setDeleting(null); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Müşteri silinemedi"); }
  };

  return (
    <>
      <PageHeader title="Müşteriler" description="Müşteri bilgilerini ve kayıtlı araçlarını yönetin." action={<Button onClick={openCreate} className="bg-blue-700 hover:bg-blue-800"><Plus />Yeni müşteri</Button>} />
      <Card className="mb-5 py-4"><CardContent className="flex-row items-center"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ad, telefon veya e-posta ile ara..." className="pl-9" /></div>{search && <Button size="icon" variant="ghost" onClick={() => setSearch("")}><X /></Button>}<div className="ml-auto hidden text-xs font-medium text-slate-400 sm:block">{customers.length} müşteri</div></CardContent></Card>
      {error && !dialogOpen && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? <LoadingState /> : customers.length === 0 ? <EmptyState title={search ? "Müşteri bulunamadı" : "İlk müşterinizi ekleyin"} description={search ? "Arama ifadenizi değiştirip tekrar deneyin." : "Araç kaydı oluşturmadan önce araç sahibini kaydedin."} action={!search && <Button onClick={openCreate}><Plus />Müşteri ekle</Button>} /> : (
        <div className="overflow-hidden rounded-[3px] border border-slate-200 bg-white">
          {customers.map((customer) => (
            <div key={customer.id} className="group grid gap-4 border-b border-slate-200 p-4 last:border-0 hover:bg-slate-50/70 md:grid-cols-[minmax(180px,1.1fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto] md:items-center md:px-5">
              <div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-[3px] border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">{getInitials(customer.name)}</div><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{customer.name}</p><p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400">Müşteri</p></div></div>
              {customer.phone ? <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"><Phone className="size-4 text-slate-400" />{customer.phone}</a> : <span className="flex items-center gap-2 text-sm text-slate-300"><Phone className="size-4" />Telefon belirtilmedi</span>}
              <div className="min-w-0 text-sm text-slate-500">{customer.email ? <a href={`mailto:${customer.email}`} className="flex items-center gap-2 truncate hover:text-blue-700"><Mail className="size-4 shrink-0 text-slate-400" />{customer.email}</a> : customer.address ? <p className="flex items-center gap-2 truncate"><MapPin className="size-4 shrink-0 text-slate-400" />{customer.address}</p> : <span className="text-slate-300">Bilgi yok</span>}</div>
              <div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" aria-label={`${customer.name} müşterisini düzenle`} onClick={() => openEdit(customer)}><MoreHorizontal /></Button><Button variant="ghost" size="icon-sm" aria-label={`${customer.name} müşterisini sil`} className="text-slate-400 hover:text-red-600" onClick={() => setDeleting(customer)}><Trash2 /></Button></div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{editing ? "Müşteriyi düzenle" : "Yeni müşteri"}</DialogTitle><DialogDescription>Müşterinin iletişim ve temel bilgilerini kaydedin.</DialogDescription></DialogHeader>
          <form onSubmit={save} className="grid gap-5">
            {error && <div role="alert" className="rounded-[3px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</div>}
            <div className="grid gap-4 sm:grid-cols-2"><FormField label="Ad soyad" required><Input value={form.name} minLength={2} maxLength={150} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></FormField><FormField label="Telefon"><Input type="tel" value={form.phone} maxLength={30} placeholder="Opsiyonel" onChange={(e) => setForm({ ...form, phone: e.target.value })} /></FormField></div>
            <FormField label="E-posta"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
            <FormField label="Adres"><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="min-h-20" /></FormField>
            <FormField label="Notlar"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-20" /></FormField>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Vazgeç</Button><Button type="submit" disabled={saving} className="bg-blue-700 hover:bg-blue-800">{saving ? "Kaydediliyor..." : "Kaydet"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="Müşteri kaydı silinsin mi?" description={`${deleting?.name ?? "Bu müşteri"} ve ilişkili bilgileri kalıcı olarak silinecek.`} onConfirm={remove} />
    </>
  );
}
