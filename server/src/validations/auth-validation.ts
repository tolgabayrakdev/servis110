import { z } from "zod";

export const registerSchema = z.object({
  workshopName: z.string().trim().min(2).max(150),
  name: z.string().trim().min(2).max(120),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1).max(72),
});

export const verifyEmailSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi girin").toLowerCase(),
  code: z.string().regex(/^\d{6}$/, "Doğrulama kodu 6 haneli olmalıdır"),
});

export const resendVerificationSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi girin").toLowerCase(),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi girin").toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().length(64, "Sıfırlama bağlantısı geçersiz"),
  newPassword: z
    .string()
    .min(8, "Yeni parola en az 8 karakter olmalıdır")
    .max(72),
});

export const updateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ad soyad en az 2 karakter olmalıdır")
    .max(120),
  email: z.email("Geçerli bir e-posta adresi girin").toLowerCase(),
  workshopName: z
    .string()
    .trim()
    .min(2, "Servis adı en az 2 karakter olmalıdır")
    .max(150),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut parolanızı girin").max(72),
    newPassword: z
      .string()
      .min(8, "Yeni parola en az 8 karakter olmalıdır")
      .max(72),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Yeni parola mevcut paroladan farklı olmalıdır",
    path: ["newPassword"],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Parolanızı girin").max(72),
  confirmation: z.literal("HESABIMI SİL", {
    error: "Onay metnini doğru yazın",
  }),
});
