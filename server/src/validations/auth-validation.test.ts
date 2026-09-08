import assert from "node:assert/strict";
import test from "node:test";
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateAccountSchema,
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
