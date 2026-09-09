import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { serviceRecordSchema, updateServiceRecordSchema } from "./service-record-validation.js";

describe("serviceRecordSchema", () => {
  it("servis işlemini bakım planından bağımsız doğrular", () => {
    const result = serviceRecordSchema.safeParse({
      serviceDate: "2026-09-07",
      mileage: 100_000,
      serviceType: "Periyodik bakım",
      operations: ["Yağ değişimi"],
      replacedParts: ["Yağ filtresi"],
    });
    assert.equal(result.success, true);
  });

  it("boş kısmi güncellemeyi reddeder", () => {
    assert.equal(updateServiceRecordSchema.safeParse({}).success, false);
  });
});
