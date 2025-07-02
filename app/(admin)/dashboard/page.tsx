"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Impor Button
import { LayoutList, Newspaper, LogOut } from "lucide-react"; // Impor ikon LogOut

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'Admin') {
      toast.error("Akses Ditolak. Halaman ini khusus untuk Admin.");
      router.push('/articles');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Fungsi untuk menangani logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    toast.success("Logout berhasil.");
    router.push('/login');
  };

  if (!isAuthorized) {
    return <div className="flex h-screen items-center justify-center">Memeriksa otorisasi...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {/* Tombol Logout ditambahkan di sini */}
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Kartu untuk Manajemen Kategori */}
        <Link href="/dashboard/categories">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader className="flex flex-row items-center gap-4">
              <LayoutList className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Manajemen Kategori</CardTitle>
                <CardDescription>Tambah atau edit kategori artikel.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Kartu untuk Manajemen Artikel */}
        <Link href="/dashboard/articles">
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader className="flex flex-row items-center gap-4">
              <Newspaper className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Manajemen Artikel</CardTitle>
                <CardDescription>Buat, edit, atau hapus artikel.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        
      </div>
    </div>
  );
}