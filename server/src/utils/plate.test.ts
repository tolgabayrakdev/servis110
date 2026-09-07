import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizePlate } from "./plate.js";

describe("normalizePlate", () => {
  it("boşluk ve tireleri kaldırıp harfleri büyütür", () => {
    assert.equal(normalizePlate("34 abc-110"), "34ABC110");
  });

  it("Türkçe küçük harfleri doğru dönüştürür", () => {
    assert.equal(normalizePlate("34 işi 01"), "34İŞİ01");
  });
});
