# 📊 Laporan Uji Performa (Load Test) API Auth: Tahap 1 (Baseline Opaque Token)

### Spesifikasi Pengujian
- **CPU:** Intel® Core™ i7-13620H Processor
- **VGA:** NVIDIA® GeForce RTX™ 4060 Laptop GPU 8GB GDDR6
- **RAM:** 6GB
- **Skenario:** 100 Virtual Users (VU) bersamaan selama 1 menit 10 detik.
- **Endpoint:** `GET http://localhost:3000/api/hello`

### 📋 Ringkasan Eksekutif
Pengujian tahap pertama ini bertujuan untuk menetapkan *baseline* (garis dasar) performa API menggunakan metode autentikasi **Opaque Token**. Pada metode ini, setiap *request* yang masuk mewajibkan Node.js untuk melakukan pengecekan (*query*) ke *database* guna mencocokkan validitas token. Secara keseluruhan, performa server sudah sangat stabil dan berhasil memenuhi target SLA (< 200ms), namun masih memiliki ruang untuk dioptimalkan secara arsitektural.

---

### 🎯 1. Metrik Kelulusan Utama (Target vs Realita)

| Indikator | Hasil Pengujian | Status | Keterangan |
| :--- | :--- | :---: | :--- |
| **Error Rate** | **0.00%** (0 dari 97.060) | ✅ LULUS | Server beroperasi dengan stabilitas sempurna. |
| **P95 Response**| **73.86 ms** | ✅ LULUS | Sangat responsif. 95% *request* selesai jauh di bawah target 200ms. |
| **Avg Response**| **46.01 ms** | ✅ LULUS | Rata-rata waktu tunggu sangat cepat. |
| **Max Response**| **185.13 ms** | ✅ LULUS | Waktu tunggu terlama (*worst-case scenario*) masih lolos standar. |
| **Min Response**| **0.3 ms (328.9 µs)** | ✅ LULUS | Kecepatan optimal eksekusi Node.js. |
| **Throughput** | **~1.386 req/detik** | ✅ LULUS | Daya tampung server menembus angka yang solid (total 97.060 request). |

---

### 🔍 2. Analisis Arsitektur & Performa (The Opaque Token Tax)
Angka P95 sebesar 73.86 ms dan *throughput* 1.386 request/detik adalah hasil yang sangat luar biasa untuk sebuah aplikasi standar. Namun, jika kita melihat dari kacamata skalabilitas tingkat tinggi, terdapat sebuah "pajak performa" tersembunyi:

* **Beban I/O Database Konstan:** Karena menggunakan Opaque Token, keberhasilan 97.060 *request* ini mengindikasikan bahwa *database* juga ikut "disiksa" dengan 97.060 *query* pencarian token (seperti `SELECT * FROM users/sessions WHERE token = ...`).
* Walaupun *database* saat ini masih sanggup melayani beban tersebut dengan cepat, skema ini tidak *stateless*. Jika jumlah *user* bertambah menjadi ribuan secara bersamaan, *database* akan menjadi *bottleneck* utama hanya karena urusan validasi sesi (*session check*).

### 💡 3. Rekomendasi Langkah Selanjutnya (Evolusi Tahap 2)
Untuk membebaskan *database* dari tugas validasi token yang menguras *resource* dan menaikkan *throughput* melampaui 1.386 req/sec, aplikasi harus berevolusi ke metode autentikasi selanjutnya:

* **Migrasi ke JWT (JSON Web Token):** Ubah arsitektur menjadi *stateless*. Dengan JWT, Node.js dapat melakukan verifikasi kriptografi langsung di level memori server tanpa perlu bertanya ke *database* sama sekali.
* **Proyeksi Target Tahap 2:** Penggantian Opaque Token menjadi JWT diproyeksikan akan melipatgandakan daya tampung *request* (*throughput*) secara drastis dan menekan angka P95 mendekati batas limit komputasi CPU murni.