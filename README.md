# Maps Backend

Backend service untuk aplikasi pemetaan geografis. Dibangun menggunakan **Node.js, Express, dan MySQL**.

## Persiapan & Cara Penggunaan

1. Pastikan Anda telah menginstal Node.js dan MySQL.
2. Buat database di MySQL (misal: `geo_grafis`).
3. Buat file `.env` di root folder backend dan isi dengan konfigurasi database:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=geo_grafis
   DB_PORT=3306
   PORT=3000
   ```
4. Install dependensi dengan menjalankan perintah:
   ```bash
   npm install
   ```
5. Jalankan server:
   ```bash
   node server.js
   ```
   *Catatan: Struktur database (tabel dan relasi) akan dibuat secara otomatis saat pertama kali server dijalankan.*

## Struktur Database

Terdapat 5 tabel utama yang saling berelasi:

### 1. `categories`
Tabel untuk menyimpan kategori lokasi.
- `id` (INT, PK)
- `name` (VARCHAR)
- `color` (VARCHAR)
- `icon_name` (VARCHAR)

### 2. `provinces`
Tabel untuk menyimpan data provinsi beserta batas wilayah (GeoJSON).
- `id` (INT, PK)
- `name` (VARCHAR)
- `geojson_data` (LONGTEXT)

### 3. `regencies`
Tabel untuk menyimpan data kabupaten/kota, berelasi dengan tabel `provinces`.
- `id` (INT, PK)
- `province_id` (INT, FK)
- `name` (VARCHAR)
- `geojson_data` (LONGTEXT)

### 4. `districts`
Tabel untuk menyimpan data kecamatan, berelasi dengan `regencies`.
- `id` (INT, PK)
- `regency_id` (INT, FK)
- `name` (VARCHAR)

### 5. `locations`
Tabel utama untuk menyimpan titik lokasi (POI) pada peta.
- `id` (INT, PK)
- `name` (VARCHAR)
- `lat` (DOUBLE) - Latitude
- `lng` (DOUBLE) - Longitude
- `category` (VARCHAR)
- `address` (TEXT)
- `country`, `province`, `city`, `district` (VARCHAR)
- `operating_hours` (VARCHAR)
- `images` (JSON)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

## Spesifikasi API

Base URL secara default: `http://localhost:3000`

### Upload
- `POST /api/upload` : Upload gambar lokasi (multipart/form-data, field `images`).

### Kategori
- `GET /api/categories` : Mengambil semua data kategori.
- `POST /api/categories` : Menambahkan kategori baru.
- `PUT /api/categories/:id` : Mengubah data kategori.
- `DELETE /api/categories/:id` : Menghapus kategori.

### Wilayah (Provinsi & Kabupaten)
- `GET /api/provinces` : Mengambil daftar provinsi.
- `GET /api/provinces/:id/geojson` : Mengambil data GeoJSON provinsi.
- `POST /api/provinces` : Menambahkan provinsi.
- `GET /api/regencies` : Mengambil daftar kabupaten/kota (bisa filter via query `?province_id=X`).
- `GET /api/regencies/:id/geojson` : Mengambil data GeoJSON kabupaten.
- `POST /api/regencies` : Menambahkan kabupaten.
- `GET /api/districts` : Mengambil daftar kecamatan.

### Lokasi (Titik Peta)
- `GET /api/locations` : Mengambil semua data lokasi.
- `GET /api/locations/:id` : Mengambil detail suatu lokasi.
- `POST /api/locations` : Menambahkan lokasi baru.
- `PUT /api/locations/:id` : Mengupdate data lokasi.
- `DELETE /api/locations/:id` : Menghapus lokasi.

### Statistik
- `GET /api/stats` : Mengambil data statistik seperti total lokasi, jumlah per kategori, dan wilayah.
