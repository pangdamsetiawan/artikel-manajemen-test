"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/lib/axios";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

// Types
interface Article {
  id: string | number;
  title: string;
  categoryId?: string;
  category?: { name: string };
  user?: { username: string };
}
interface Category {
  id: string | number;
  name: string;
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Untuk modal konfirmasi hapus
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | number | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "Admin") {
      toast.error("Akses Ditolak.");
      router.push("/articles");
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");

      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          apiClient.get("/articles", { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get("/categories", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setAllArticles(articlesRes.data.data);
        setFilteredArticles(articlesRes.data.data);

        const validCategories = categoriesRes.data.data.filter(
          (cat: Category) => String(cat.id).trim() !== ""
        );
        setCategories(validCategories);

      } catch {
        toast.error("Gagal mengambil data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthorized]);

  useEffect(() => {
    let results = allArticles;

    if (selectedCategory) {
      results = results.filter(
        (article) => article.categoryId === selectedCategory
      );
    }

    if (debouncedSearchTerm) {
      results = results.filter((article) =>
        article.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    setFilteredArticles(results);
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, allArticles]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openDeleteDialog = (id: string | number) => {
    setSelectedArticleId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedArticleId) return;

    const token = localStorage.getItem("authToken");
    try {
      await apiClient.delete(`/articles/${selectedArticleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Artikel berhasil dihapus.");

      const updated = allArticles.filter((a) => a.id !== selectedArticleId);
      setAllArticles(updated);
      setFilteredArticles(updated);
    } catch {
      toast.error("Gagal menghapus artikel.");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedArticleId(null);
    }
  };

  if (!isAuthorized) {
    return <div className="flex h-screen items-center justify-center">Memeriksa otorisasi...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Dashboard
        </Link>
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Artikel</h1>
        <Button asChild>
          <Link href="/dashboard/articles/create">Tambah Artikel</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Cari artikel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select
          onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}
          value={selectedCategory || "all"}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Memuat...</TableCell>
              </TableRow>
            ) : currentItems.length > 0 ? (
              currentItems.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category?.name || "-"}</TableCell>
                  <TableCell>{article.user?.username || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/articles/edit/${article.id}`}>Edit</Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(article.id)}>
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Artikel tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {[...Array(totalPages).keys()].map((num) => (
                <PaginationItem key={num + 1}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(num + 1);
                    }}
                    isActive={currentPage === num + 1}
                  >
                    {num + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Modal konfirmasi hapus */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={confirmDelete}>Hapus</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
