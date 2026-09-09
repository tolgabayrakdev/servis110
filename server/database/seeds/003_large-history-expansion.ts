import { createHash } from "node:crypto";
import type { Knex } from "knex";

const TARGET_USER_ID = "6f79b09a-28a9-4f00-a723-4442915fd199";
const MARKER = "[servis110-large-demo-v2]";

const uuid = (type: string, index: number) => {
  const hex = createHash("sha256")
    .update(`${TARGET_USER_ID}:large-v2:${type}:${index}`)
    .digest("hex")
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-b${hex.slice(17, 20)}-${hex.slice(20)}`;
};

const dateOnly = (date: Date) => date.toISOString().slice(0, 10);
const monthsAgo = (months: number, offset = 0) => {
  const date = new Date();
  date.setUTCHours(10, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() - months);
  date.setUTCDate(2 + ((months + offset) % 25));
  return date;
};
const daysFromNow = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return dateOnly(date);
};

const names = [
  "Ahmet", "Mehmet", "Mustafa", "Ali", "Hüseyin", "Hasan", "İsmail", "Murat",
  "Emre", "Burak", "Can", "Onur", "Ayşe", "Fatma", "Emine", "Zeynep",
  "Elif", "Selin", "Derya", "Ceren", "Gökçe", "Ece", "Buse", "Merve",
];
const surnames = [
  "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Aydın", "Arslan",
  "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özdemir",
  "Şimşek", "Polat", "Öztürk", "Aktaş", "Avcı", "Tekin", "Eren", "Güneş",
];
const locations = [
  "Kadıköy", "Üsküdar", "Ataşehir", "Maltepe", "Kartal", "Pendik", "Tuzla",
  "Beşiktaş", "Şişli", "Kağıthane", "Bakırköy", "Bahçelievler", "Sarıyer",
  "Beykoz", "Başakşehir", "Beylikdüzü", "Avcılar", "Eyüpsultan",
];
const carModels = [
  ["Renault", "Megane"], ["Renault", "Clio"], ["Fiat", "Egea"],
  ["Fiat", "Fiorino"], ["Ford", "Focus"], ["Ford", "Transit"],
  ["Toyota", "Corolla"], ["Toyota", "C-HR"], ["Volkswagen", "Golf"],
  ["Volkswagen", "Passat"], ["Honda", "Civic"], ["Hyundai", "Tucson"],
  ["Hyundai", "i20"], ["Peugeot", "2008"], ["Peugeot", "3008"],
  ["Citroën", "C4"], ["Opel", "Corsa"], ["Opel", "Astra"],
  ["Skoda", "Superb"], ["Dacia", "Duster"], ["Nissan", "Qashqai"],
  ["Kia", "Sportage"], ["Seat", "Leon"], ["Volvo", "XC40"],
  ["BMW", "320i"], ["Mercedes-Benz", "C 200"], ["Audi", "A4"],
] as const;
const services = [
  ["Periyodik bakım", ["Motor yağı değişimi", "Filtrelerin kontrolü", "Genel mekanik kontrol"], ["Motor yağı", "Yağ filtresi", "Polen filtresi"]],
  ["Fren sistemi", ["Fren testi", "Disk ve balata kontrolü"], ["Ön fren balatası"]],
  ["Elektrik / elektronik", ["Akü testi", "Şarj sistemi kontrolü", "Arıza kodu taraması"], ["Akü kutup başı"]],
  ["Klima bakımı", ["Klima performans testi", "Gaz basıncı kontrolü"], ["Klima gazı", "Polen filtresi"]],
  ["Ön takım kontrolü", ["Rot-balans ayarı", "Süspansiyon kontrolü"], ["Z-rot", "Rot başı"]],
  ["Lastik işlemi", ["Lastik kontrolü", "Balans ayarı"], ["Lastik sibobu"]],
  ["Motor onarımı", ["Kompresyon kontrolü", "Motor kaçak kontrolü", "Yol testi"], ["Buji", "Conta"]],
  ["Muayene hazırlığı", ["Aydınlatma kontrolü", "Fren testi", "Emisyon ön kontrolü"], []],
] as const;

export async function seed(knex: Knex): Promise<void> {
  const user = await knex("users").select("workshop_id as workshopId").where({ id: TARGET_USER_ID }).first();
  if (!user) throw new Error(`Geniş demo verisi için hedef kullanıcı bulunamadı: ${TARGET_USER_ID}`);
  if (await knex("customers").where({ workshop_id: user.workshopId, notes: MARKER }).first()) return;

  await knex.transaction(async (trx) => {
    const customers = Array.from({ length: 120 }, (_, index) => {
      const name = names[(index * 5) % names.length]!;
      const surname = surnames[(index * 11 + 3) % surnames.length]!;
      const createdAt = monthsAgo(60 - (index % 42), index);
      return {
        id: uuid("customer", index),
        workshop_id: user.workshopId,
        name: `${name} ${surname}`,
        phone: `05${32 + (index % 18)} ${String(200 + index).slice(-3)} ${String(10 + (index % 89)).padStart(2, "0")} ${String(11 + (index * 3) % 88).padStart(2, "0")}`,
        email: index % 5 === 0 ? null : `musteri${index + 101}@example.com`,
        address: `${locations[index % locations.length]} Mah. ${index + 1}. Sok. No: ${2 + (index % 38)}, İstanbul`,
        notes: index === 0 ? MARKER : index % 17 === 0 ? "Filo müşterisi — işlemler için yetkili onayı alınır." : null,
        created_at: createdAt,
        updated_at: createdAt,
      };
    });
    await trx.batchInsert("customers", customers, 100);

    const cityCodes = ["34", "06", "35", "16", "07", "41", "42", "10"];
    const vehicles = Array.from({ length: 180 }, (_, index) => {
      const [brand, model] = carModels[(index * 7) % carModels.length]!;
      const count = 12 + (index % 7);
      const step = 5_800 + (index % 6) * 310;
      const latestMileage = 18_000 + index * 730 + (count - 1) * step;
      const createdAt = monthsAgo(60 - (index % 28), index);
      return {
        id: uuid("vehicle", index),
        workshop_id: user.workshopId,
        customer_id: uuid("customer", index % customers.length),
        plate: `${cityCodes[index % cityCodes.length]}LX${String(2000 + index)}`,
        brand,
        model,
        year: 2008 + (index % 18),
        current_mileage: latestMileage + 300 + (index % 9) * 260,
        created_at: createdAt,
        updated_at: monthsAgo(0, index),
      };
    });
    await trx.batchInsert("vehicles", vehicles, 100);

    const records = vehicles.flatMap((vehicle, vehicleIndex) => {
      const count = 12 + (vehicleIndex % 7);
      const step = 5_800 + (vehicleIndex % 6) * 310;
      return Array.from({ length: count }, (_, recordIndex) => {
        const age = (count - 1 - recordIndex) * 4 + (vehicleIndex % 5);
        const serviceDate = monthsAgo(age, vehicleIndex + recordIndex);
        const [type, operations, parts] = services[(vehicleIndex + recordIndex * 3) % services.length]!;
        return {
          id: uuid(`service-${vehicleIndex}`, recordIndex),
          workshop_id: user.workshopId,
          vehicle_id: vehicle.id,
          service_date: dateOnly(serviceDate),
          mileage: 18_000 + vehicleIndex * 730 + recordIndex * step,
          service_type: type,
          operations: JSON.stringify(operations),
          replaced_parts: JSON.stringify(recordIndex % 5 === 0 ? [] : parts),
          description: recordIndex % 4 === 0 ? "Kontroller tamamlandı, araç yol testi sonrasında müşteriye teslim edildi." : null,
          created_at: serviceDate,
          updated_at: serviceDate,
        };
      });
    });
    await trx.batchInsert("service_records", records, 100);

    await trx.batchInsert(
      "maintenance_reminders",
      vehicles.slice(0, 96).map((vehicle, index) => ({
        id: uuid("reminder", index),
        workshop_id: user.workshopId,
        vehicle_id: vehicle.id,
        title: index % 2 === 0 ? "Periyodik bakım iletişimi" : "Yağ bakımı hatırlatması",
        due_date: daysFromNow(index % 8 === 0 ? -20 : index % 5 === 0 ? 10 : 45 + (index % 90)),
        due_mileage: vehicle.current_mileage + (index % 7 === 0 ? 600 : 8_000),
        notes: index % 6 === 0 ? "Müşteriye WhatsApp üzerinden bilgi verilecek." : null,
        status: index % 13 === 0 ? "completed" : index % 17 === 0 ? "cancelled" : "active",
        completed_at: index % 13 === 0 ? trx.fn.now() : null,
      })),
      100,
    );
  });
}
