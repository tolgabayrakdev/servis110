import {
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
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
import { getInitials } from "@/lib/formatters";
import type { Customer, Paginated } from "@/types/api-types";

type CustomerForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};
const emptyForm: CustomerForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get<Paginated<Customer>>(
        `/customers?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ""}`,
      );
      setCustomers(response.data);
      setMeta(response.meta);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Müşteriler yüklenemedi",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);
  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setError("");
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };
  const openEdit = (customer: Customer) => {
    setError("");
    setEditing(customer);
    setForm({
      name: customer.name,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
      notes: customer.notes ?? "",
    });
    setDialogOpen(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
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
      setDialogOpen(false);
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Müşteri kaydedilemedi",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await apiClient.delete(`/customers/${deleting.id}`);
      setDeleting(null);
      if (customers.length === 1 && page > 1) setPage((value) => value - 1);
      else await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Müşteri silinemedi");
    }
  };

  return (
    <>
      <PageHeader
        title="Müşteriler"
        description="Müşteri bilgilerini ve kayıtlı araçlarını yönetin."
        action={
          <Button onClick={openCreate}>
            <Plus />
            Yeni müşteri
          </Button>
        }
      />
      <div className="toolbar">
        <div className="flex w-full items-center gap-2 sm:w-auto sm:min-w-96">
          <div className="search-field">
            <Search />
            <Input
              aria-label="Müşteri ara"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="İsim, telefon veya e-posta ara"
            />
          </div>
          {search && (
            <Button
              aria-label="Aramayı temizle"
              size="icon"
              variant="ghost"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              <X />
            </Button>
          )}
        </div>
        <span className="count-label">
          {meta.total} kayıt
        </span>
      </div>
      {loading ? (
        <LoadingState />
      ) : error && !dialogOpen ? (
        <ErrorState message={error} retry={load} />
      ) : customers.length === 0 ? (
        <EmptyState
          title={
            search
              ? "Eşleşen müşteri yok"
              : "Müşteri rehberiniz burada başlıyor."
          }
          description={
            search
              ? "Başka bir isim veya iletişim bilgisiyle arayın."
              : "İlk müşterinizi ekleyerek araç ve servis kayıtlarını bir arada tutun."
          }
          action={
            !search && (
              <Button onClick={openCreate}>
                <Plus />
                Müşteri ekle
              </Button>
            )
          }
        />
      ) : (
        <div className="panel">
          <div className="panel-heading">
            <h2 className="panel-title">Müşteri rehberi</h2>
            <span className="eyebrow hidden sm:inline">
              İletişim & kayıt bilgileri
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Müşteri</th>
                  <th className="hidden sm:table-cell">İletişim</th>
                  <th className="hidden lg:table-cell">Adres</th>
                  <th>
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="person-initials hidden sm:grid">
                          {getInitials(customer.name)}
                        </span>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground sm:hidden">
                            {customer.phone || "Telefon belirtilmedi"}
                          </p>
                          <p className="mt-1 hidden text-[11px] text-muted-foreground sm:block">
                            Müşteri kaydı
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      <div className="grid gap-1.5 text-xs text-secondary-foreground">
                        {customer.phone ? (
                          <a
                            href={`tel:${customer.phone}`}
                            className="flex items-center gap-2"
                          >
                            <Phone className="size-3" />
                            {customer.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">
                            Telefon belirtilmedi
                          </span>
                        )}
                        {customer.email && (
                          <a
                            href={`mailto:${customer.email}`}
                            className="flex items-center gap-2 break-all text-muted-foreground"
                          >
                            <Mail className="size-3 shrink-0" />
                            {customer.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="hidden max-w-64 lg:table-cell">
                      <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                        {customer.address && (
                          <MapPin className="mt-0.5 size-3.5 shrink-0" />
                        )}
                        {customer.address || "Adres belirtilmedi"}
                      </p>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`${customer.name} müşterisini düzenle`}
                          onClick={() => openEdit(customer)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`${customer.name} müşterisini sil`}
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleting(customer)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={setPage}
          />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Müşteriyi düzenle" : "Yeni müşteri"}
            </DialogTitle>
            <DialogDescription>
              Müşterinin iletişim ve temel bilgilerini kaydedin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-5">
            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
              >
                {error}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Ad soyad" required>
                <Input
                  value={form.name}
                  minLength={2}
                  maxLength={150}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Telefon">
                <Input
                  type="tel"
                  value={form.phone}
                  maxLength={30}
                  placeholder="Opsiyonel"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </FormField>
            </div>
            <FormField label="E-posta">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField label="Adres">
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="min-h-20"
              />
            </FormField>
            <FormField label="Notlar">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="min-h-20"
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
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Müşteri kaydı silinsin mi?"
        description={`${deleting?.name ?? "Bu müşteri"} ve ilişkili bilgileri kalıcı olarak silinecek.`}
        onConfirm={remove}
      />
    </>
  );
}
