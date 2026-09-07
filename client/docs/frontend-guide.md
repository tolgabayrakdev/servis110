# Servis110 frontend

React 19, React Router, Tailwind CSS ve Base UI ile hazırlanmıştır.

## Çalıştırma

```bash
cp .env.example .env
npm run dev
```

Backend varsayılan olarak `http://localhost:3000/api/v1` adresinde beklenir. Farklı bir adres için `.env` içindeki `VITE_API_URL` değiştirilir.

Authentication JWT'yi JavaScript'e açmaz. Tüm API çağrıları `credentials: "include"` ile yapılır ve backend'in HttpOnly cookie'si kullanılır.

## Ekranlar

- `/login`: giriş
- `/register`: servis hesabı oluşturma
- `/dashboard`: özet, son işlemler ve bakım uyarıları
- `/customers`: müşteri listeleme, arama, ekleme ve düzenleme
- `/vehicles`: araç listeleme, plaka arama, ekleme ve düzenleme
- `/vehicles/:id`: servis geçmişi, yeni servis kaydı ve QR kod
- `/service-card/:token`: müşteriye açık dijital servis karnesi

## Tasarım sistemi

Yeni arayüz beyaz sol menü, geniş çalışma alanı, okunaklı Inter başlıkları ve sade veri tabloları kullanır. Açık tema beyaz/açık gri; koyu tema nötr grafittir. Yüzeylerde 4px köşe yarıçapı, en az 44px ana kontrol yüksekliği ve ferah satır aralıkları tercih edilir. Renkler `src/index.css` içindeki semantik değişkenlerden gelir: `background`, `card`, `foreground`, `muted`, `border`, `primary`, `destructive` ve `warning`. Sayfalarda sabit slate/blue renkleri veya koyu mod için global utility override yazılmamalıdır.

- `PageHeader`: sayfa başlığı, açıklama ve aksiyonlar.
- `Card`, `panel`, `data-table`: içerik yüzeyleri ve kayıt listeleri.
- `AuthShell`: giriş/kayıt ekranlarının ortak yerleşimi.
- `ServiceHistory`: yönetim ve herkese açık servis karnesinde aynı kayıt görünümü.
- `FormField`, `Input`, `Textarea`, `Dialog`: ortak form düzeni.
- `ModeToggle`: klavyeyle kullanılabilen açık/koyu/sistem menüsü.

Tema tercihi `servis110-theme` anahtarında tutulur. `index.html` başlangıç scripti ile `ThemeProvider` aynı varsayılanı ve ilk arka plan rengini kullanmalıdır. QR kodun beyaz zemini okunabilirlik için bilinçli olarak tema dışında kalır.
