import assert from "node:assert/strict";
import test from "node:test";
import {
  changePasswordSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateAccountSchema,
  verifyEmailSchema,
} from "./auth-validation.js";

test("hesap bilgilerini normalize eder", () => {
  const result = updateAccountSchema.parse({
    name: "  Ayşe Usta  ",
    email: "AYSE@EXAMPLE.COM",
    workshopName: "  Merkez Oto  ",
  });
  assert.deepEqual(result, {
    name: "Ayşe Usta",
    email: "ayse@example.com",
    workshopName: "Merkez Oto",
  });
});

test("parola sıfırlama girdilerini doğrular", () => {
  assert.equal(
    forgotPasswordSchema.parse({ email: "USTA@EXAMPLE.COM" }).email,
    "usta@example.com",
  );
  assert.equal(
    resetPasswordSchema.safeParse({
      token: "a".repeat(64),
      newPassword: "Yeni1234!",
    }).success,
    true,
  );
  assert.equal(
    resetPasswordSchema.safeParse({
      token: "kisa-token",
      newPassword: "123",
    }).success,
    false,
  );
});

test("e-posta doğrulama kodu tam 6 rakam olmalıdır", () => {
  assert.equal(
    verifyEmailSchema.safeParse({
      email: "USTA@EXAMPLE.COM",
      code: "123456",
    }).success,
    true,
  );
  assert.equal(
    verifyEmailSchema.safeParse({
      email: "usta@example.com",
      code: "12345a",
    }).success,
    false,
  );
});

test("yeni parola mevcut paroladan farklı ve en az 8 karakter olmalıdır", () => {
  assert.equal(
    changePasswordSchema.safeParse({
      currentPassword: "Demo1234!",
      newPassword: "Demo1234!",
    }).success,
    false,
  );
  assert.equal(
    changePasswordSchema.safeParse({
      currentPassword: "Demo1234!",
      newPassword: "Yeni1234!",
    }).success,
    true,
  );
});

test("hesap silme tam onay metnini gerektirir", () => {
  assert.equal(
    deleteAccountSchema.safeParse({
      password: "Demo1234!",
      confirmation: "sil",
    }).success,
    false,
  );
  assert.equal(
    deleteAccountSchema.safeParse({
      password: "Demo1234!",
      confirmation: "HESABIMI SİL",
    }).success,
    true,
  );
});
