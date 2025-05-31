# 🎁 Paket Lebaran - Frontend & Backend (Docker Edition)
 
Ini adalah paket image Docker yang berisi aplikasi **frontend** dan **backend** untuk proyek "Paket Lebaran".  

---

## 📦 Isi Paket

- `backend.tar` → Image backend (Node.js API)
- `frontend.tar` → Image frontend (HTML/JS/React/Next/etc)
- `docker-compose.yml` → File konfigurasi untuk menjalankan dua container sekaligus

---

## 🛠️ Cara Menjalankan

### 1. Pastikan Docker Sudah Terinstall

- [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Jalankan Docker-nya sampai aktif

---

### 2. Import Image dari `.tar`

Buka terminal/PowerShell dan jalankan:

```bash
docker load -i backend.tar
docker load -i frontend.tar
Cek apakah berhasil:

bash
docker images
Harus muncul:

paket-lebaran-backend    latest
paket-lebaran-frontend   latest
3. Jalankan Aplikasi
Ada dua cara:

✅ Cara A (paling gampang): Docker Compose
Pastikan docker-compose.yml ada di folder yang sama.

Jalankan:

bash
docker compose up -d
Tunggu sampai container jalan~

🌐 Akses Aplikasimu
Backend → http://localhost:3001

Frontend → http://localhost:3000

🚦 Hentikan Aplikasi
Kalau mau berhentiin semua container:

bash
docker compose down


❓ Troubleshooting
Port already in use
Pastikan port 3000 dan 3001 nggak dipakai aplikasi lain.

Image not found?
Cek lagi hasil docker load, pastikan berhasil tanpa error.

Docker Desktop stuck?
Restart Docker Desktop dan ulangi langkahnya.