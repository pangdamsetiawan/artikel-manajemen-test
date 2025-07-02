# Proyek Tes: Aplikasi Manajemen Artikel

Ini adalah proyek yang dibuat sebagai bagian dari tes untuk posisi Frontend Web Developer. Aplikasi ini adalah sistem manajemen artikel yang mendukung dua peran pengguna: **User** dan **Admin**, dengan fitur dan hak akses yang berbeda untuk masing-masing peran.

## Live Demo

Aplikasi ini sudah di-deploy dan dapat diakses secara langsung melalui URL berikut:
**artikel-manajemen-test.vercel.app**

---

## Fitur Utama

### ✅ Fitur untuk Peran User
-   **Otentikasi**: Login, Register, dan Logout dengan validasi form.
-   **Daftar Artikel**:
    -   Pencarian artikel dengan *debounce* untuk performa optimal.
    -   Filter artikel berdasarkan kategori.
    -   Paginasi jika jumlah artikel lebih dari 9.
-   **Detail Artikel**:
    -   Menampilkan konten lengkap artikel.
    -   Menampilkan 3 artikel terkait dari kategori yang sama.

### ✅ Fitur untuk Peran Admin
-   **Otorisasi**: Halaman dashboard dan manajemen yang hanya bisa diakses oleh Admin.
-   **Manajemen Kategori**:
    -   Menampilkan, mencari, dan paginasi daftar kategori.
    -   Menambah dan mengedit kategori melalui dialog/pop-up.
-   **Manajemen Artikel**:
    -   Menampilkan, mencari, dan memfilter daftar semua artikel.
    -   Menambah dan mengedit artikel menggunakan form dengan validasi.
    -   Rich Text Editor (Tiptap) untuk pembuatan konten.
    -   Fitur "Preview" sebelum artikel disimpan.

---

## Teknologi yang Digunakan

-   **Framework**: Next.js 14+ (App Router)
-   **Styling**: Tailwind CSS
-   **UI Komponen**: Shadcn/UI
-   **Manajemen Form & Validasi**: React Hook Form & Zod
-   **Fetching API**: Axios
-   **Editor Teks**: Tiptap
-   **Ikon**: Lucide React
-   **Version Control**: Git & GitHub (Git Flow)

---

## Cara Menjalankan Proyek Secara Lokal

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

1.  **Clone repository ini:**
    ```bash
    git clone https://github.com/pangdamsetiawan/artikel-manajemen-test
    ```

2.  **Masuk ke direktori proyek:**
    ```bash
    cd nama-folder-proyek
    ```

3.  **Install semua dependensi:**
    ```bash
    npm install
    ```

4.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```

5.  Buka **[http://localhost:3000](http://localhost:3000)** di browser Anda.

---

## Kontak

Dibuat oleh - **Pangdam R. Setiawan**
