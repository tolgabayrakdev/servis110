import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalıdır").max(150, "Ad soyad en fazla 150 karakter olabilir"),
  phone: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(30, "Telefon numarası en fazla 30 karakter olabilir").nullish(),
  ),
  email: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().toLowerCase().pipe(z.email("Geçerli bir e-posta adresi girin")).nullish(),
  ),
  address: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(500, "Adres en fazla 500 karakter olabilir").nullish(),
  ),
  notes: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(2000, "Notlar en fazla 2000 karakter olabilir").nullish(),
  ),
});

export const updateCustomerSchema = customerSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "En az bir alan gönderilmelidir",
});
