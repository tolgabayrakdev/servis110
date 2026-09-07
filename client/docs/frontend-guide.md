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
