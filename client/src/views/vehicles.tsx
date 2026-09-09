import { ArrowUpRight, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
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
import { apiClient } from "@/lib/api-client";
import { formatMileage } from "@/lib/formatters";
import type { Customer, Paginated, Vehicle } from "@/types/api-types";

type VehicleForm = {
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  currentMileage: string;
};
const emptyForm: VehicleForm = {
  customerId: "",
  plate: "",
  brand: "",
  model: "",
  year: "",
  currentMileage: "",
};

export default function Vehicles() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const page = Math.max(Number(params.get("page")) || 1, 1);
  const setSearch = (value: string) =>
    setParams(value ? { search: value } : {}, { replace: true });
  const setPage = (nextPage: number) =>
    setParams(
      {
        ...(search ? { search } : {}),
        ...(nextPage > 1 ? { page: String(nextPage) } : {}),
      },
      { replace: true },
    );
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [vehicleResponse, customerResponse] = await Promise.all([
        apiClient.get<Paginated<Vehicle>>(
          `/vehicles?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ""}`,
        ),
        apiClient.get<Paginated<Customer>>("/customers?limit=1000"),
      ]);
      setVehicles(vehicleResponse.data);
      setMeta(vehicleResponse.meta);
      setCustomers(customerResponse.data);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Araçlar yüklenemedi",
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
    setForm({ ...emptyForm, customerId: customers[0]?.id ?? "" });
    setDialogOpen(true);
  };
  const openEdit = (vehicle: Vehicle) => {
    setError("");
    setEditing(vehicle);
    setForm({
      customerId: vehicle.customerId,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year?.toString() ?? "",
      currentMileage: vehicle.currentMileage.toString(),
    });
    setDialogOpen(true);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      customerId: form.customerId,
      plate: form.plate,
      brand: form.brand,
      model: form.model,
      year: form.year ? Number(form.year) : null,
      currentMileage: Number(form.currentMileage),
    };
    try {
      if (editing) await apiClient.patch(`/vehicles/${editing.id}`, payload);
      else await apiClient.post("/vehicles", payload);
      setDialogOpen(false);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Araç kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!deleting) return;
    try {
      await apiClient.delete(`/vehicles/${deleting.id}`);
      setDeleting(null);
      if (vehicles.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Araç silinemedi");
    }
  };

  return (
    <>
      <PageHeader
        title="Araçlar"
        description="Kayıtlı araçları bulun ve dijital servis geçmişine ulaşın."
        action={
          <Button onClick={openCreate} disabled={customers.length === 0}>
            <Plus />
            Yeni araç
          </Button>
        }
      />
      <div className="toolbar">
        <div className="flex w-full items-center gap-2 sm:w-auto sm:min-w-96">
          <div className="search-field">
            <Search />
            <Input
              aria-label="Araç ara"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Plaka, marka veya müşteri ara"
            />
          </div>
          {search && (
            <Button
              aria-label="Aramayı temizle"
              size="icon"
              variant="ghost"
              onClick={() => setSearch("")}
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
      ) : vehicles.length === 0 ? (
        <EmptyState
          title={search ? "Eşleşen araç yok" : "Her aracın bir hikâyesi var."}
          description={
            search
              ? "Farklı bir plaka, marka veya müşteri adı deneyin."
              : customers.length === 0
                ? "Araç kaydı oluşturmak için önce araç sahibini ekleyin."
                : "İlk aracınızı ekleyerek servis geçmişini kaydetmeye başlayın."
          }
          action={
            !search &&
            (customers.length === 0 ? (
              <Button render={<Link to="/customers" />}>
                <Plus />
                Müşteri ekle
              </Button>
            ) : (
              <Button onClick={openCreate}>
                <Plus />
                Araç ekle
              </Button>
            ))
          }
        />
      ) : (
        <div className="panel">
          <div className="panel-heading">
            <h2 className="panel-title">Araç kayıtları</h2>
            <span className="eyebrow hidden sm:inline">
              Araç & servis geçmişi
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Araç</th>
                  <th className="hidden md:table-cell">Araç sahibi</th>
                  <th className="hidden sm:table-cell">Kilometre</th>
                  <th>
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>
                      <Link to={`/vehicles/${vehicle.id}`} className="plate">
                        {vehicle.plate}
                      </Link>
                      <p className="mt-2 text-xs text-secondary-foreground">
                        {vehicle.brand} {vehicle.model}
                        <span className="text-muted-foreground">
                          {vehicle.year ? ` · ${vehicle.year}` : ""}
                        </span>
                      </p>
                    </td>
                    <td className="hidden md:table-cell">
                      <p className="text-sm font-medium">
                        {vehicle.customerName}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {vehicle.customerPhone || "Telefon belirtilmedi"}
                      </p>
                    </td>
                    <td className="hidden whitespace-nowrap text-xs text-secondary-foreground sm:table-cell">
                      {formatMileage(vehicle.currentMileage)}
                    </td>
                    <td>
                      <div className="flex justify-end gap-0.5">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`${vehicle.plate} aracını düzenle`}
                          onClick={() => openEdit(vehicle)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`${vehicle.plate} aracını sil`}
                          onClick={() => setDeleting(vehicle)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`${vehicle.plate} detayını aç`}
                          render={<Link to={`/vehicles/${vehicle.id}`} />}
                        >
                          <ArrowUpRight />
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Aracı düzenle" : "Yeni araç"}</DialogTitle>
            <DialogDescription>
              Araç ve sahip bilgilerini kaydedin.
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
            <FormField label="Araç sahibi" required>
              <select
                value={form.customerId}
                onChange={(e) =>
                  setForm({ ...form, customerId: e.target.value })
                }
                className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-ring"
                required
              >
                <option value="">Müşteri seçin</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                    {customer.phone ? ` · ${customer.phone}` : ""}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Plaka" required>
                <Input
                  value={form.plate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      plate: e.target.value.toLocaleUpperCase("tr-TR"),
                    })
                  }
                  placeholder="34 ABC 110"
                  required
                />
              </FormField>
              <FormField label="Yıl">
                <Input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Marka" required>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Toyota"
                  required
                />
              </FormField>
              <FormField label="Model" required>
                <Input
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="Corolla"
                  required
                />
              </FormField>
            </div>
            <FormField label="Güncel kilometre" required>
              <Input
                type="number"
                min="0"
                value={form.currentMileage}
                onChange={(e) =>
                  setForm({ ...form, currentMileage: e.target.value })
                }
                placeholder="125000"
                required
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
        title="Araç kaydı silinsin mi?"
        description={`${deleting?.plate ?? "Bu araç"} plakasına ait araç ve servis geçmişi kalıcı olarak silinecek.`}
        onConfirm={remove}
      />
    </>
  );
}
