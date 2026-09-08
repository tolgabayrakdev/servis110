import { KeyRound, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
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
import { useAuth } from "@/contexts/auth-state";

type Notice = { type: "success" | "error"; message: string } | null;

function NoticeView({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p
      role="status"
      className={`rounded-md border px-4 py-3 text-sm ${notice.type === "success" ? "border-border bg-muted text-secondary-foreground" : "border-destructive/25 bg-destructive/10 text-destructive"}`}
    >
      {notice.message}
    </p>
  );
}

export default function SettingsView() {
  const { user, updateAccount, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    workshopName: user?.workshopName ?? "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileNotice, setProfileNotice] = useState<Notice>(null);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteForm, setDeleteForm] = useState({
    password: "",
    confirmation: "",
  });
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileNotice(null);
    try {
      await updateAccount({
        name: profile.name.trim(),
        email: profile.email.trim(),
        workshopName: profile.workshopName.trim(),
      });
      setProfileNotice({
        type: "success",
        message: "Hesap bilgileriniz güncellendi.",
      });
    } catch (caught) {
      setProfileNotice({
        type: "error",
        message:
          caught instanceof Error ? caught.message : "Bilgiler güncellenemedi",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordNotice(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordNotice({
        type: "error",
        message: "Yeni parolalar eşleşmiyor.",
      });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordNotice({
        type: "success",
        message: "Parolanız değiştirildi.",
      });
    } catch (caught) {
      setPasswordNotice({
        type: "error",
        message:
          caught instanceof Error ? caught.message : "Parola değiştirilemedi",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const removeAccount = async (event: FormEvent) => {
    event.preventDefault();
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount(deleteForm);
      navigate("/login", { replace: true });
    } catch (caught) {
      setDeleteError(
        caught instanceof Error ? caught.message : "Hesap silinemedi",
      );
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Ayarlar"
        description="Hesap, servis ve güvenlik bilgilerinizi yönetin."
      />
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">Hesap ve servis bilgileri</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Panelde görünen temel bilgiler.
                </p>
              </div>
              <UserRound className="size-5 text-muted-foreground" />
            </div>
            <form
              onSubmit={saveProfile}
              className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8"
            >
              <div className="sm:col-span-2">
                <NoticeView notice={profileNotice} />
              </div>
              <FormField label="Ad soyad" required>
                <Input
                  value={profile.name}
                  minLength={2}
                  maxLength={120}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  required
                />
              </FormField>
              <FormField label="E-posta adresi" required>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  required
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Servis adı" required>
                  <Input
                    value={profile.workshopName}
                    minLength={2}
                    maxLength={150}
                    disabled={user?.role !== "owner"}
                    onChange={(e) =>
                      setProfile({ ...profile, workshopName: e.target.value })
                    }
                    required
                  />
                </FormField>
                {user?.role !== "owner" && (
                  <p className="form-note mt-2">
                    Servis adını yalnızca işletme yöneticisi değiştirebilir.
                  </p>
                )}
              </div>
              <div className="sm:col-span-2 flex justify-end border-t border-border pt-5">
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
                </Button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">Parola değiştir</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hesabınız için güçlü ve benzersiz bir parola kullanın.
                </p>
              </div>
              <KeyRound className="size-5 text-muted-foreground" />
            </div>
            <form onSubmit={savePassword} className="grid gap-5 p-6 sm:p-8">
              <NoticeView notice={passwordNotice} />
              <FormField label="Mevcut parola" required>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Yeni parola" required>
                  <Input
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                </FormField>
                <FormField label="Yeni parola tekrar" required>
                  <Input
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </FormField>
              </div>
              <div className="flex justify-end border-t border-border pt-5">
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? "Değiştiriliyor…" : "Parolayı değiştir"}
                </Button>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="panel p-6">
            <ShieldCheck className="mb-5 size-5 text-muted-foreground" />
            <h2 className="panel-title">Hesap güvenliği</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Parolanızı başka platformlarda kullanmayın ve ekip üyeleriyle
              paylaşmayın.
            </p>
            <dl className="mt-5 grid gap-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Rol</dt>
                <dd>
                  {user?.role === "owner"
                    ? "İşletme yöneticisi"
                    : "Servis ekibi"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">E-posta</dt>
                <dd className="truncate">{user?.email}</dd>
              </div>
            </dl>
          </section>
          <section className="border-t border-destructive/30 pt-6">
            <Trash2 className="mb-4 size-5 text-destructive" />
            <h2 className="text-base font-semibold">Hesabı sil</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {user?.role === "owner"
                ? "Servis hesabı, müşteriler, araçlar ve tüm servis kayıtları kalıcı olarak silinir."
                : "Kullanıcı hesabınız kalıcı olarak silinir."}
            </p>
            <Button
              variant="destructive"
              className="mt-5"
              onClick={() => {
                setDeleteError("");
                setDeleteForm({ password: "", confirmation: "" });
                setDeleteOpen(true);
              }}
            >
              <Trash2 />
              Hesabı sil
            </Button>
          </section>
        </aside>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hesabı kalıcı olarak sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Devam etmek için parolanızı ve onay
              metnini girin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={removeAccount} className="grid gap-5">
            {deleteError && (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {deleteError}
              </p>
            )}
            <FormField label="Parola" required>
              <Input
                type="password"
                autoComplete="current-password"
                value={deleteForm.password}
                onChange={(e) =>
                  setDeleteForm({ ...deleteForm, password: e.target.value })
                }
                required
              />
            </FormField>
            <FormField label='Onaylamak için "HESABIMI SİL" yazın' required>
              <Input
                value={deleteForm.confirmation}
                onChange={(e) =>
                  setDeleteForm({ ...deleteForm, confirmation: e.target.value })
                }
                required
              />
            </FormField>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOpen(false)}
              >
                Vazgeç
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={
                  deleting || deleteForm.confirmation !== "HESABIMI SİL"
                }
              >
                {deleting ? "Siliniyor…" : "Hesabı kalıcı olarak sil"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
