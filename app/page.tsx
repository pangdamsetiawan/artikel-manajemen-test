"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Periksa apakah ada token di localStorage
    const token = localStorage.getItem('authToken');

    if (token) {
      // Jika ada token (pengguna sudah login), arahkan ke daftar artikel
      router.replace('/articles');
    } else {
      // Jika tidak ada token, arahkan ke halaman login
      router.replace('/login');
    }
  }, [router]);

  // Tampilkan pesan loading sederhana selama proses redirect
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Mengarahkan...</p>
    </div>
  );
}