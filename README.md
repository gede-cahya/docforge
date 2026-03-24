# DocForge v2 - AI Chat PRD & PSD Generator

DocForge adalah platform berbasis AI untuk membantu Product Manager dan Developer menyusun dokumen **Product Requirements Document (PRD)** dan **Product Specification Document (PSD)** secara instan melalui antarmuka chat yang intuitif.

![Preview](public/screenshots/preview.webp)

## ✨ Fitur Utama
- **Unified AI Chat**: Brainstorm ide dan buat dokumen dalam satu percakapan.
- **Developer App Mode**: Mode khusus arsitektur teknis dengan fase tanya-jawab.
- **Better Auth & Supabase**: Sistem login aman dengan riwayat chat tersimpan.
- **Custom Tech Stack**: Paksa AI menggunakan teknologi pilihan Anda.
- **Export Ready**: Download hasil dalam format **Markdown (.md)** atau **PDF**.

## 🚀 Cara Install

### 1. Clone Repository
```bash
git clone https://github.com/gede-cahya/docforge.git
cd docforge
```

### 2. Install Dependencies
Pastikan Anda memiliki [Bun](https://bun.sh) terinstall:
```bash
bun install
```

### 3. Konfigurasi Environment (`.env`)
Buat file `.env` di root folder:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
BETTER_AUTH_SECRET="your-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

### 4. Setup Ollama (Local AI)
DocForge membutuhkan **Ollama** terinstall di perangkat Anda.
1. Download di [ollama.com](https://ollama.com).
2. Jalankan model yang dibutuhkan:
```bash
ollama run minimax-m2.5:cloud
# atau
ollama run hermes3
```

### 5. Jalankan Database Migration (Drizzle)
```bash
bun x drizzle-kit push
```

### 6. Jalankan Aplikasi
```bash
bun run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📸 Screenshots
### Login Page
![Login](public/screenshots/login.png)

---
Dibuat dengan ❤️ untuk efisiensi dokumentasi produk.
