import { createHash } from "node:crypto";
import type { Knex } from "knex";

const TARGET_USER_ID = "6f79b09a-28a9-4f00-a723-4442915fd199";
const SEED_MARKER = "[servis110-five-year-demo]";

const uuid = (type: string, index: number) => {
  const hex = createHash("sha256")
    .update(`${TARGET_USER_ID}:${type}:${index}`)
    .digest("hex")
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`;
};

const dateAtMonthsAgo = (months: number, dayOffset = 0) => {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() - months);
  date.setUTCDate(Math.min(24, 4 + (months % 19)) + dayOffset);
  return date;
};

const dateOnly = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (days: number) => {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return dateOnly(date);
};

const firstNames = [
  "Ahmet", "Mehmet", "Ayşe", "Fatma", "Mustafa", "Emine", "Ali", "Zeynep",
  "Murat", "Elif", "Hasan", "Selin", "İbrahim", "Derya", "Ömer", "Ceren",
];
const lastNames = [
  "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Aydın", "Arslan",
  "Koç", "Kurt", "Özkan", "Aksoy", "Polat", "Eren", "Tekin", "Güneş",
];
const districts = [
  "Kadıköy", "Üsküdar", "Ataşehir", "Maltepe", "Kartal", "Pendik", "Beşiktaş",
  "Şişli", "Bakırköy", "Bahçelievler", "Beylikdüzü", "Sarıyer",
];
const vehicles = [
  ["Renault", "Clio"], ["Fiat", "Egea"], ["Toyota", "Corolla"],
  ["Ford", "Focus"], ["Volkswagen", "Passat"], ["Honda", "Civic"],
  ["Hyundai", "i20"], ["Peugeot", "3008"], ["Citroën", "C3"],
  ["Opel", "Astra"], ["Skoda", "Octavia"], ["Dacia", "Duster"],
  ["Mercedes-Benz", "C 200"], ["BMW", "320i"], ["Audi", "A3"],
  ["Nissan", "Qashqai"], ["Kia", "Sportage"], ["Seat", "Leon"],
] as const;

const serviceTemplates = [
  {
    type: "Periyodik bakım",
    operations: ["Motor yağı ve filtre değişimi", "Genel mekanik kontrol", "Sıvı seviyelerinin kontrolü"],
    parts: ["Motor yağı", "Yağ filtresi", "Polen filtresi"],
  },
  {
    type: "Fren bakımı",
    operations: ["Fren sistemi kontrolü", "Balata değişimi", "Fren hidroliği kontrolü"],
    parts: ["Ön fren balatası", "Fren hidroliği"],
  },
  {
    type: "Ağır bakım",
    operations: ["Triger seti değişimi", "Devirdaim pompası kontrolü", "Antifriz değişimi"],
    parts: ["Triger seti", "V kayışı", "Antifriz"],
  },
  {
    type: "Klima bakımı",
    operations: ["Klima gazı kontrolü", "Kaçak testi", "Polen filtresi değişimi"],
    parts: ["Polen filtresi", "Klima gazı"],
  },
  {
    type: "Ön takım kontrolü",
    operations: ["Rot-balans ayarı", "Süspansiyon kontrolü", "Lastik kontrolü"],
    parts: ["Rot başı", "Z-rot"],
  },
  {
    type: "Arıza tespiti",
    operations: ["Bilgisayarlı arıza tespiti", "Elektrik sistemi kontrolü", "Yol testi"],
    parts: ["Sensör", "Sigorta"],
  },
] as const;

export async function seed(knex: Knex): Promise<void> {
  const user = await knex("users")
    .select("workshop_id as workshopId")
    .where({ id: TARGET_USER_ID })
    .first();
  if (!user) {
    throw new Error(`Yoğun demo verisi için hedef kullanıcı bulunamadı: ${TARGET_USER_ID}`);
  }

  const alreadySeeded = await knex("customers")
    .where({ workshop_id: user.workshopId, notes: SEED_MARKER })
    .first();
  if (alreadySeeded) return;

  await knex.transaction(async (trx) => {
    const customerRows = Array.from({ length: 48 }, (_, index) => {
      const firstName = firstNames[index % firstNames.length]!;
      const lastName = lastNames[(index * 7) % lastNames.length]!;
      const createdAt = dateAtMonthsAgo(60 - (index % 20));
      return {
        id: uuid("customer", index),
        workshop_id: user.workshopId,
        name: `${firstName} ${lastName}`,
        phone: `05${30 + (index % 20)} ${String(100 + index).slice(-3)} ${String(20 + index).padStart(2, "0")} ${String(40 + index).padStart(2, "0")}`,
        email: index % 4 === 0 ? null : `${firstName.toLocaleLowerCase("tr-TR")}.${lastName.toLocaleLowerCase("tr-TR")}@example.com`,
        address: `${districts[index % districts.length]} Mah. ${12 + index}. Sok. No: ${3 + (index % 24)}, İstanbul`,
        notes: index === 0 ? SEED_MARKER : index % 9 === 0 ? "Kurumsal müşteri — bakım öncesi telefonla bilgi verilsin." : null,
        created_at: createdAt,
        updated_at: createdAt,
      };
    });
    await trx("customers").insert(customerRows);

    const vehicleRows = Array.from({ length: 64 }, (_, index) => {
      const [brand, model] = vehicles[index % vehicles.length]!;
      const ageMonths = 60 - (index % 18);
      const serviceCount = 8 + (index % 5);
      const latestMileage =
        22_000 +
        index * 1_850 +
        (serviceCount - 1) * (6_800 + (index % 5) * 250);
      return {
        id: uuid("vehicle", index),
        workshop_id: user.workshopId,
        customer_id: uuid("customer", index % customerRows.length),
        plate: `34S${String(1100 + index)}`,
        brand,
        model,
        year: 2012 + (index % 14),
        current_mileage: latestMileage + 450 + (index % 7) * 430,
        created_at: dateAtMonthsAgo(ageMonths),
        updated_at: dateAtMonthsAgo(0),
      };
    });
    await trx("vehicles").insert(vehicleRows);

    const serviceRows = vehicleRows.flatMap((vehicle, vehicleIndex) => {
      const count = 8 + (vehicleIndex % 5);
      const startingMileage = 22_000 + vehicleIndex * 1_850;
      return Array.from({ length: count }, (_, recordIndex) => {
        const monthsAgo = (count - 1 - recordIndex) * 5 + (vehicleIndex % 4);
        const serviceDate = dateAtMonthsAgo(monthsAgo, vehicleIndex % 5);
        const template = serviceTemplates[(vehicleIndex + recordIndex) % serviceTemplates.length]!;
        const mileage = startingMileage + recordIndex * (6_800 + (vehicleIndex % 5) * 250);
        return {
          id: uuid(`service-${vehicleIndex}`, recordIndex),
          workshop_id: user.workshopId,
          vehicle_id: vehicle.id,
          service_date: dateOnly(serviceDate),
          mileage,
          service_type: template.type,
          operations: JSON.stringify(template.operations),
          replaced_parts: JSON.stringify(recordIndex % 4 === 3 ? [] : template.parts),
          description:
            recordIndex % 3 === 0
              ? "Araç genel kontrolden geçirildi. Yol testi sonrası müşteriye teslim edildi."
              : recordIndex % 4 === 0
                ? "Müşteri talebi doğrultusunda ek kontroller yapıldı, önemli bir soruna rastlanmadı."
                : null,
          created_at: serviceDate,
          updated_at: serviceDate,
        };
      });
    });

    // PostgreSQL parametre sınırına yaklaşmamak için servisleri gruplar halinde ekle.
    await trx.batchInsert("service_records", serviceRows, 100);

    await trx("maintenance_reminders").insert(
      vehicleRows.map((vehicle, index) => ({
        id: uuid("reminder", index),
        workshop_id: user.workshopId,
        vehicle_id: vehicle.id,
        title:
          index % 3 === 0
            ? "Periyodik bakım kontrolü"
            : index % 3 === 1
              ? "Yağ ve filtre bakımı"
              : "Genel araç kontrolü",
        due_date:
          index % 5 === 0
            ? addDays(-35)
            : index % 5 === 1
              ? addDays(14)
              : addDays(90 + (index % 5) * 20),
        due_mileage:
          index % 5 === 2
            ? vehicle.current_mileage + 700
            : vehicle.current_mileage + 10_000,
        notes: index % 4 === 0 ? "Müşteriye randevu öncesi telefonla bilgi verilsin." : null,
        status: "active",
      })),
    );
  });
}
