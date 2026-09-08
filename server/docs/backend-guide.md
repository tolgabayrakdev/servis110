# Servis110 backend

Express 5, TypeScript, PostgreSQL, Knex ve JWT ile hazırlanmış REST API'dir. Kod sınıf kullanmaz; controller, service ve repository katmanlarının tamamı object pattern ile dışa aktarılır.

## Çalıştırma

```bash
docker compose up -d
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Demo hesabı: `demo@servis110.test` / `Demo1234!`

Production derlemesi:

```bash
npm run build
npm start
```

## Katmanlar

- `controllers`: HTTP istek ve cevapları
- `services`: iş kuralları ve tenant kontrolleri
- `repositories`: Knex/PostgreSQL sorguları
- `routes`: endpoint tanımları
- `validations`: Zod giriş doğrulama şemaları
- `middlewares`: JWT, doğrulama ve hata yönetimi
- `database`: migration ve seed dosyaları

Tüm özel kayıtlar JWT içindeki `workshopId` ile filtrelenir. Bir servis başka servisin verilerine erişemez.

## Endpoint özeti

| Metot            | Yol                                           | Açıklama                                           |
| ---------------- | --------------------------------------------- | -------------------------------------------------- |
| POST             | `/api/v1/auth/register`                       | Servis ve işletme sahibi oluşturur                 |
| POST             | `/api/v1/auth/login`                          | JWT üretir                                         |
| POST             | `/api/v1/auth/logout`                         | Oturum cookie'sini temizler                        |
| GET              | `/api/v1/auth/me`                             | Aktif kullanıcıyı döndürür                         |
| PATCH            | `/api/v1/auth/account`                        | Ad, e-posta ve servis adını günceller              |
| PATCH            | `/api/v1/auth/password`                       | Mevcut parola doğrulamasıyla parolayı değiştirir   |
| DELETE           | `/api/v1/auth/account`                        | Parola ve onay metniyle hesabı kalıcı olarak siler |
| GET/POST         | `/api/v1/customers`                           | Müşteri listeleme/oluşturma                        |
| GET/PATCH/DELETE | `/api/v1/customers/:id`                       | Müşteri yönetimi                                   |
| GET/POST         | `/api/v1/vehicles`                            | Araç listeleme/oluşturma                           |
| GET              | `/api/v1/vehicles/search?plate=34ABC110`      | Plaka ile hızlı arama                              |
| GET/PATCH/DELETE | `/api/v1/vehicles/:id`                        | Araç yönetimi                                      |
| GET/POST         | `/api/v1/vehicles/:vehicleId/service-records` | Araç servis geçmişi                                |
| GET/PATCH/DELETE | `/api/v1/service-records/:id`                 | Servis kaydı yönetimi                              |
| GET              | `/api/v1/dashboard`                           | Sayaçlar, son servisler ve bakım uyarıları         |
| GET              | `/api/v1/public/service-cards/:token`         | Public dijital servis karnesi                      |

Register ve login sonucunda JWT, JavaScript'in erişemediği `HttpOnly` cookie'ye yazılır. Korumalı endpoint isteklerinde tarayıcı tarafında cookie gönderimi açılmalıdır:

```ts
fetch("http://localhost:3000/api/v1/auth/me", {
  credentials: "include",
});
```

Axios kullanılıyorsa `withCredentials: true` verilmelidir. Middleware, CLI ve harici API istemcileri için `Authorization: Bearer <token>` başlığını geriye dönük olarak da destekler.

Araç cevaplarındaki `serviceCardUrl` değeri frontend'de `react-qr-code` bileşenine doğrudan verilebilir. Backend QR görseli üretmez.
