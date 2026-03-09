# 🏆 Laporan Komprehensif Evolusi Arsitektur API Auth: Opaque Token vs JWT vs JWT + Redis

### Spesifikasi Pengujian
- **CPU:** Intel® Core™ i7-13620H Processor
- **VGA:** NVIDIA® GeForce RTX™ 4060 Laptop GPU 8GB GDDR6
- **RAM:** 6GB
- **Skenario:** 100 Virtual Users (VU) bersamaan selama 1 menit 10 detik.
- **Endpoint:** `GET http://localhost:3000/api/hello`

### 📋 Ringkasan Eksekutif
Laporan ini mendokumentasikan evolusi performa (*performance tuning*) pada sistem autentikasi. Pengujian dilakukan melalui tiga tahap arsitektur: (1) Validasi berbasis *Database* menggunakan Opaque Token, (2) Validasi Kriptografi *Stateless* menggunakan murni JWT, dan (3) Validasi Hibrida menggunakan JWT yang di-*cache* di Redis. 

Hasil akhir pada Tahap 3 menunjukkan lonjakan performa tingkat *Enterprise*, di mana aplikasi menembus angka lebih dari **setengah juta request** dalam hitungan 70 detik dengan latensi nyaris nol.

---

### 📊 Perbandingan Metrik Keseluruhan (3 Fase Evolusi)

| Indikator Performa | Tahap 1 (Opaque/DB) | Tahap 2 (Pure JWT) | Tahap 3 (JWT + Redis) | 🚀 Total Peningkatan (T1 vs T3) |
| :--- | :--- | :--- | :--- | :--- |
| **Total Request Sukses** | 97.060 request | 128.216 request | **620.273 request** | 🔥 **Naik 539% (6.3x Lipat)** |
| **Throughput (Kecepatan)**| ~1.386 req / detik | ~1.831 req / detik | **~8.860 req / detik** | 🚀 **Naik 539%** |
| **P95 Response Time** | 73.86 ms | 52.6 ms | **11.15 ms** | ⚡ **Lebih Cepat 84.9%** |
| **Rata-rata Response** | 46.01 ms | 34.81 ms | **7.16 ms** | ⚡ **Lebih Cepat 84.4%** |
| **Max Response (Terburuk)**| 185.13 ms | 96.27 ms | **37.0 ms** | 🛡️ **Lebih Cepat 80%** |
| **Min Response (Tercepat)**| 0.3 ms | 0.0 ms | **0.0 ms (Sub-ms)** | 🏎️ **Maksimal Kecepatan Jaringan** |
| **Error Rate** | 0.00% | 0.00% | **0.00%** | 100% Sempurna (Sangat Stabil) |

---

### 🔍 Analisis Evolusi Arsitektur: *Breaking the Bottlenecks*

#### 🔴 Tahap 1: Opaque Token (*The I/O Bottleneck*)
Pada tahap ini, arsitektur terhambat oleh lambatnya operasi *Input/Output* (I/O) pada *database* relasional. Proses membuka koneksi, mencari token (*query*), dan membalas *request* memberikan "pajak waktu" yang membuat daya tampung server tertahan di ~1.300 request per detik.

#### 🟡 Tahap 2: Murni JWT (*The CPU Bottleneck*)
Dengan membuang *database* dan beralih ke validasi JWT lokal, performa naik 32%. Namun, arsitektur ini membentur tembok baru: **Keterbatasan Single-Thread Node.js**. Proses dekripsi dan verifikasi *signature* JWT (`jwt.verify()`) adalah operasi matematika yang berat secara komputasi (*CPU-bound*), sehingga *Event Loop* Node.js kewalahan menangani antrean kriptografi saat *traffic* tinggi.

#### 🟢 Tahap 3: JWT + Redis Cache (*The Ultimate Scale*)
Dengan menyimpan JWT (atau status validitasnya) ke dalam Redis, Node.js berhasil memotong kompas secara jenius. Alih-alih melakukan komputasi kriptografi yang berat untuk setiap *request*, Node.js hanya perlu melakukan operasi baca dari *Memory* (RAM) via Redis. 
* **Keuntungan Ganda:** Arsitektur ini tidak memblokir CPU (*non-blocking I/O*) sekaligus jauh lebih cepat daripada *database* konvensional. 
* **Hasil:** Angka P95 anjlok ke **11.15 ms** dan daya tampung meledak hingga hampir **9.000 request per detik**. Sebagai bonus, aplikasi kini memiliki fitur *Session Revocation* (kemampuan me-*logout* paksa pengguna), sebuah fitur mutlak di tingkat *Enterprise* yang mustahil dilakukan oleh murni JWT.

### 💡 Kesimpulan Akhir
Kombinasi **JWT + Redis** telah terbukti secara empiris sebagai arsitektur autentikasi paling superior. Sistem ini secara elegan menyeimbangkan tiga pilar utama API modern: **Keamanan Mutlak** (token bisa dikontrol/dicabut), **Skalabilitas Ekstrem** (620k+ request tanpa *error*), dan **Efisiensi Resource** (bisa berjalan mulus tanpa menyiksa CPU maupun Database).