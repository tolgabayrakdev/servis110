import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { serviceRecordSchema, updateServiceRecordSchema } from "./service-record-validation.js";

describe("serviceRecordSchema", () => {
  it("sonraki bakımı servis kaydından ileride kabul eder", () => {
    const result = serviceRecordSchema.safeParse({
      serviceDate: "2026-09-07",
      mileage: 100_000,
      serviceType: "Periyodik bakım",
      operations: ["Yağ değişimi"],
      replacedParts: ["Yağ filtresi"],
      nextServiceDate: "2027-09-07",
      nextServiceMileage: 110_000,
    });
    assert.equal(result.success, true);
  });

  it("kısmi güncellemede yalnızca sonraki bakım kilometresini kabul eder", () => {
    assert.equal(updateServiceRecordSchema.safeParse({ nextServiceMileage: 120_000 }).success, true);
  });

  it("geçmiş bir sonraki bakım değerini reddeder", () => {
    const result = serviceRecordSchema.safeParse({
      serviceDate: "2026-09-07",
      mileage: 100_000,
      serviceType: "Bakım",
      operations: [],
      replacedParts: [],
      nextServiceDate: "2026-01-01",
      nextServiceMileage: 90_000,
    });
    assert.equal(result.success, false);
  });
});
