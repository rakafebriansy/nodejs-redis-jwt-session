# 🚀 Laporan Peningkatan Performa (Improvement Report) API Auth: Tahap 2 (Implementasi JWT)

### Spesifikasi Pengujian
- **CPU:** Intel® Core™ i7-13620H Processor
- **VGA:** NVIDIA® GeForce RTX™ 4060 Laptop GPU 8GB GDDR6
- **RAM:** 6GB
- **Skenario:** 100 Virtual Users (VU) bersamaan selama 1 menit 10 detik.
- **Endpoint:** `GET http://localhost:3000/api/hello`

### 📋 Ringkasan Eksekutif
Pada pengujian Tahap 2 ini, arsitektur autentikasi telah dimigrasikan dari metode **Opaque Token** (berbasis *database*) menjadi **JSON Web Token / JWT** (berbasis kriptografi *stateless*). Migrasi ini berhasil menghilangkan beban I/O pada *database*, meningkatkan daya tampung server hingga 32%, dan memangkas waktu latensi. Namun, pengujian ini juga mengungkap *bottleneck* baru pada arsitektur *single-thread* Node.js.

---

### 📊 Perbandingan Metrik (Tahap 1 vs Tahap 2)

| Indikator Performa | Tahap 1 (Opaque Token / DB) | Tahap 2 (JWT / Stateless) | 📈 Tingkat Peningkatan |
| :--- | :--- | :--- | :--- |
| **Total Request Sukses** | 97.060 request | **128.216 request** | 🔥 **Naik ~32% (+31.156 req)** |
| **Throughput (Kecepatan)**| ~1.386 req / detik | **~1.831 req / detik** | 🚀 **Naik ~32%** |
| **P95 Response Time** | 73.86 ms | **52.6 ms** | ⚡ **Lebih Cepat 28.7%** |
| **Rata-rata Response** | 46.01 ms | **34.81 ms** | ⚡ **Lebih Cepat 24.3%** |
| **Max Response (Terburuk)**| 185.13 ms | **96.27 ms** | 🛡️ **Lebih Cepat 48%** |
| **Error Rate** | 0.00% | **0.00%** | Tetap Sempurna (100% Sukses) |

---

### 🔍 Analisis Arsitektur: Pergeseran *Bottleneck* (I/O vs CPU)

1. **Kemenangan Atas Database:** Dengan beralih ke JWT, 128.216 *request* ini sama sekali tidak menyentuh MySQL/MariaDB. *Database* kini 100% terbebas dari tugas validasi sesi yang repetitif.
2. **Kelemahan Single-Thread Node.js (CPU-Bound):** Meskipun lebih cepat dari Opaque Token, lonjakan performa JWT tidak seekstrem penggunaan Redis. Hal ini dikarenakan proses `jwt.verify()` membutuhkan komputasi kriptografi matematis. Karena Node.js berjalan pada *single-thread* (Event Loop), proses dekripsi 1.800+ token per detik ini memonopoli CPU. Node.js berhenti menunggu *database* (I/O Bound), tetapi kini mencapai limit komputasi prosesornya sendiri (CPU Bound).

### 💡 3. Langkah Selanjutnya (Evolusi Tahap 3: JWT + Redis)
Meskipun JWT sangat cepat dan membebaskan *database*, JWT memiliki kelemahan fatal dari sisi keamanan bisnis: **JWT tidak bisa di-logout/dibatalkan (revoke) sebelum masa kedaluwarsanya habis**.

Untuk menggabungkan keamanan absolut Opaque Token dan performa instan JWT, langkah selanjutnya adalah mengimplementasikan arsitektur hibrida: **Menyimpan sesi aktif / *blacklist* JWT di dalam Redis.**
Karena Redis berjalan di memori dan tidak membebani komputasi kriptografi Node.js secara masif, kombinasi ini diproyeksikan akan memberikan keamanan tingkat *Enterprise* dengan kecepatan *sub-millisecond*.