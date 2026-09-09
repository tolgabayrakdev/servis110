import assert from "node:assert/strict";
import test from "node:test";
import { reminderSchema, reminderStatusSchema } from "./reminder-validation.js";

test("hatırlatıcı tarih veya kilometreden en az birini gerektirir", () => {
  assert.equal(
    reminderSchema.safeParse({ title: "Yağ bakımı", dueDate: "2026-12-01" }).success,
    true,
  );
  assert.equal(reminderSchema.safeParse({ title: "Yağ bakımı" }).success, false);
});

test("hatırlatıcı durumlarını doğrular", () => {
  assert.equal(reminderStatusSchema.safeParse({ status: "completed" }).success, true);
  assert.equal(reminderStatusSchema.safeParse({ status: "waiting" }).success, false);
});
