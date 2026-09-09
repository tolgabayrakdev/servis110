import { createHash } from "node:crypto";
import type { Knex } from "knex";

const USER_ID = "6f79b09a-28a9-4f00-a723-4442915fd199";
const MARKER = "[servis110-enterprise-demo-v3]";

const uuid = (kind: string, index: number) => {
  const value = createHash("sha256").update(`${USER_ID}:enterprise-v3:${kind}:${index}`).digest("hex").slice(0, 32);
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-4${value.slice(13, 16)}-8${value.slice(17, 20)}-${value.slice(20)}`;
};
const historicalDate = (monthsBack: number, salt: number) => {
  const date = new Date();
  date.setUTCHours(9, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() - monthsBack);
  date.setUTCDate(1 + ((salt * 7) % 26));
  return date;
};
const dateOnly = (date: Date) => date.toISOString().slice(0, 10);
const futureDate = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return dateOnly(date);
};

const firstNames = ["Ahmet", "Mehmet", "Ali", "Mustafa", "Murat", "Emre", "Burak", "Onur", "Serkan", "Kemal", "Ayşe", "Zeynep", "Elif", "Selin", "Derya", "Merve", "Ece", "Buse", "Deniz", "Gizem"];
const lastNames = ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Aydın", "Arslan", "Doğan", "Kılıç", "Çetin", "Kara", "Koç", "Özdemir", "Şimşek", "Öztürk", "Aktaş", "Tekin", "Eren", "Güneş"];
const districts = ["Kadıköy", "Üsküdar", "Ataşehir", "Maltepe", "Kartal", "Pendik", "Tuzla", "Şişli", "Beşiktaş", "Kağıthane", "Bakırköy", "Sarıyer", "Beykoz", "Avcılar", "Başakşehir", "Beylikdüzü"];
const models = [
  ["Renault", "Clio"], ["Renault", "Megane"], ["Fiat", "Egea"], ["Fiat", "Doblo"],
  ["Ford", "Focus"], ["Ford", "Tourneo Courier"], ["Toyota", "Corolla"], ["Toyota", "Yaris"],
  ["Volkswagen", "Golf"], ["Volkswagen", "Tiguan"], ["Honda", "Civic"], ["Hyundai", "i20"],
  ["Hyundai", "Tucson"], ["Peugeot", "208"], ["Peugeot", "3008"], ["Citroën", "C4"],
  ["Opel", "Corsa"], ["Opel", "Astra"], ["Skoda", "Octavia"], ["Dacia", "Duster"],
  ["Nissan", "Qashqai"], ["Kia", "Sportage"], ["Seat", "Leon"], ["Volvo", "XC60"],
  ["BMW", "520i"], ["Mercedes-Benz", "E 200"], ["Audi", "A3"], ["Tesla", "Model Y"],
] as const;
const jobTemplates = [
  { type: "Periyodik bakım", ops: ["Motor yağı değişimi", "Filtre kontrolü", "Sıvı seviye kontrolü"], parts: ["Motor yağı", "Yağ filtresi"] },
  { type: "Yağ ve filtre değişimi", ops: ["Yağ tahliyesi", "Filtre değişimi", "Kaçak kontrolü"], parts: ["Motor yağı", "Yağ filtresi", "Hava filtresi"] },
  { type: "Fren sistemi", ops: ["Fren testi", "Balata kalınlık ölçümü", "Hidrolik kontrolü"], parts: ["Fren balatası", "Fren hidroliği"] },
  { type: "Mekanik onarım", ops: ["Mekanik arıza tespiti", "Parça kontrolü", "Yol testi"], parts: ["Motor takozu"] },
  { type: "Elektrik / elektronik", ops: ["Diagnostik tarama", "Akü testi", "Şarj dinamosu kontrolü"], parts: ["Sensör", "Sigorta"] },
  { type: "Klima bakımı", ops: ["Klima gaz basıncı ölçümü", "Kaçak testi", "Dezenfeksiyon"], parts: ["Klima gazı", "Polen filtresi"] },
  { type: "Lastik işlemi", ops: ["Diş derinliği ölçümü", "Basınç ayarı", "Balans kontrolü"], parts: ["Lastik sibobu"] },
  { type: "Ön takım kontrolü", ops: ["Rot kontrolü", "Amortisör testi", "Salıncak kontrolü"], parts: ["Z-rot", "Rot başı"] },
  { type: "Ağır bakım", ops: ["Triger değişimi", "Devirdaim kontrolü", "Soğutma sistemi bakımı"], parts: ["Triger seti", "V kayışı", "Antifriz"] },
  { type: "Muayene hazırlığı", ops: ["Fren testi", "Far ayarı", "Emisyon ön kontrolü"], parts: [] },
] as const;

export async function seed(knex: Knex): Promise<void> {
  const user = await knex("users").select("workshop_id as workshopId").where({ id: USER_ID }).first();
  if (!user) throw new Error(`Kurumsal demo verisi için hedef kullanıcı bulunamadı: ${USER_ID}`);
  if (await knex("customers").where({ workshop_id: user.workshopId, notes: MARKER }).first()) return;

  await knex.transaction(async (trx) => {
    const customers = Array.from({ length: 250 }, (_, index) => {
      const createdAt = historicalDate(60 - (index % 48), index);
      return {
        id: uuid("customer", index),
        workshop_id: user.workshopId,
        name: `${firstNames[(index * 7) % firstNames.length]} ${lastNames[(index * 13 + 2) % lastNames.length]}`,
        phone: `05${30 + (index % 20)} ${String(300 + (index % 700)).padStart(3, "0")} ${String(10 + (index % 90)).slice(-2)} ${String(10 + ((index * 9) % 90)).slice(-2)}`,
        email: index % 6 === 0 ? null : `servis.musteri${index + 500}@example.com`,
        address: `${districts[index % districts.length]} Mah. ${20 + (index % 80)}. Cad. No: ${1 + (index % 55)}, İstanbul`,
        notes: index === 0 ? MARKER : index % 23 === 0 ? "Birden fazla aracı bulunan düzenli müşteri." : index % 31 === 0 ? "Randevu bilgisini WhatsApp üzerinden tercih ediyor." : null,
        created_at: createdAt,
        updated_at: createdAt,
      };
    });
    await trx.batchInsert("customers", customers, 100);

    const cities = ["34", "06", "35", "16", "07", "41", "10", "26", "27", "31", "33", "55"];
    const vehicles = Array.from({ length: 420 }, (_, index) => {
      const count = 10 + (index % 9);
      const mileageStep = 5_200 + (index % 8) * 280;
      const latestMileage = 12_000 + index * 510 + (count - 1) * mileageStep;
      const createdAt = historicalDate(60 - (index % 36), index);
      const [brand, model] = models[(index * 9 + 4) % models.length]!;
      return {
        id: uuid("vehicle", index),
        workshop_id: user.workshopId,
        customer_id: uuid("customer", index % customers.length),
        plate: `${cities[index % cities.length]}ZX${3000 + index}`,
        brand,
        model,
        year: 2006 + (index % 20),
        current_mileage: latestMileage + 250 + (index % 11) * 190,
        created_at: createdAt,
        updated_at: historicalDate(0, index),
      };
    });
    await trx.batchInsert("vehicles", vehicles, 100);

    const records = vehicles.flatMap((vehicle, vehicleIndex) => {
      const count = 10 + (vehicleIndex % 9);
      const mileageStep = 5_200 + (vehicleIndex % 8) * 280;
      return Array.from({ length: count }, (_, recordIndex) => {
        const monthsBack = (count - 1 - recordIndex) * 3 + (vehicleIndex % 6);
        const date = historicalDate(monthsBack, vehicleIndex + recordIndex);
        const job = jobTemplates[(vehicleIndex * 2 + recordIndex * 3) % jobTemplates.length]!;
        return {
          id: uuid(`service-${vehicleIndex}`, recordIndex),
          workshop_id: user.workshopId,
          vehicle_id: vehicle.id,
          service_date: dateOnly(date),
          mileage: 12_000 + vehicleIndex * 510 + recordIndex * mileageStep,
          service_type: job.type,
          operations: JSON.stringify(job.ops),
          replaced_parts: JSON.stringify(recordIndex % 6 === 0 ? [] : job.parts),
          description: recordIndex % 5 === 0 ? "Araç kabul formundaki talepler kontrol edildi. İşlem sonrası test sürüşü yapıldı." : recordIndex % 7 === 0 ? "Müşteriye yapılan kontroller ve sonraki kullanım önerileri aktarıldı." : null,
          created_at: date,
          updated_at: date,
        };
      });
    });
    await trx.batchInsert("service_records", records, 100);

    const reminders = vehicles.slice(0, 210).map((vehicle, index) => {
      const completed = index % 19 === 0;
      const cancelled = !completed && index % 29 === 0;
      return {
        id: uuid("reminder", index),
        workshop_id: user.workshopId,
        vehicle_id: vehicle.id,
        title: index % 3 === 0 ? "Periyodik bakım için iletişim" : index % 3 === 1 ? "Yağ bakımı takibi" : "Genel kontrol hatırlatması",
        due_date: futureDate(index % 12 === 0 ? -30 : index % 7 === 0 ? 7 : 35 + (index % 120)),
        due_mileage: vehicle.current_mileage + (index % 10 === 0 ? 500 : 7_500 + (index % 4) * 1_000),
        notes: index % 8 === 0 ? "Müşteriye WhatsApp mesajı gönderilmesi planlandı." : null,
        status: completed ? "completed" : cancelled ? "cancelled" : "active",
        completed_at: completed ? trx.fn.now() : null,
      };
    });
    await trx.batchInsert("maintenance_reminders", reminders, 100);
  });
}
