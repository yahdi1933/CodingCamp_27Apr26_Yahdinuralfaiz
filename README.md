# 💰 Visualisasi Pengeluaran & Anggaran

Aplikasi web untuk melacak pengeluaran harian dengan visualisasi grafik berdasarkan kategori. Dibangun sebagai bagian dari CodingCamp RevoU.

---

## 🚀 Fitur Utama

- **Form Input** — Tambah transaksi dengan nama barang, jumlah, dan kategori
- **Validasi Form** — Semua kolom wajib diisi sebelum bisa submit
- **Daftar Transaksi** — Riwayat semua transaksi yang bisa digulir dan dihapus
- **Saldo Total** — Ditampilkan di bagian atas dan diperbarui otomatis
- **Grafik Lingkaran** — Visualisasi pengeluaran per kategori menggunakan Chart.js
- **LocalStorage** — Data tersimpan di browser, tidak hilang saat halaman di-refresh

---

## ⭐ Tantangan Tambahan

1. **Kategori Khusus** — Pengguna bisa menambahkan kategori baru selain Makanan, Transportasi, dan Hiburan
2. **Ringkasan Bulanan** — Menampilkan total pengeluaran bulan ini beserta rincian per kategori
3. **Batas Pengeluaran** — Set batas budget per kategori, muncul peringatan otomatis jika melebihi batas

---

## 🛠️ Teknologi

- HTML5
- CSS3
- JavaScript (Vanilla — tanpa framework)
- [Chart.js](https://www.chartjs.org/) — untuk grafik lingkaran
- LocalStorage API — untuk penyimpanan data di sisi klien

---

## 📁 Struktur Folder

```
project/
├── index.html        # Halaman utama aplikasi
├── css/
│   └── style.css     # Styling aplikasi
├── js/
│   └── script.js     # Logic aplikasi
└── README.md
```

---

## 📖 Cara Menjalankan

1. Clone atau download repositori ini
2. Buka folder di VS Code
3. Install ekstensi **Live Server** (by Ritwick Dey)
4. Klik kanan `index.html` → **Open with Live Server**
5. Aplikasi akan terbuka di browser

---

## 👤 Dibuat Oleh

Proyek ini dibuat sebagai bagian dari **CodingCamp RevoU** — kursus rekayasa perangkat lunak 5 hari.
