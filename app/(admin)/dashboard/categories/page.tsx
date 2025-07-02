"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/lib/axios";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ========== TYPE ==========

interface Category {
  id: string | number;
  name: string;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Nama kategori minimal 3 karakter." }),
});

interface CategoryFormProps {
  initialData?: Category | null;
  onSuccess: () => void;
  setOpen: (open: boolean) => void;
}

// ========== FORM TAMBAH / EDIT ==========

function CategoryForm({ initialData, onSuccess, setOpen }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: initialData?.name || "" },
  });

  useEffect(() => {
    form.reset({ name: initialData?.name || "" });
  }, [initialData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (initialData) {
        await apiClient.put(`/categories/${initialData.id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Kategori berhasil diperbarui!");
      } else {
        await apiClient.post("/categories", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Kategori baru berhasil dibuat!");
      }
      onSuccess();
      setOpen(false);
    } catch {
      toast.error(initialData ? "Gagal memperbarui kategori." : "Gagal membuat kategori baru.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Teknologi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ========== HALAMAN DASHBOARD KATEGORI ADMIN ==========

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "Admin") {
      toast.error("Akses Ditolak. Halaman ini khusus untuk Admin.");
      router.push("/articles");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      fetchData(currentPage, debouncedSearchTerm);
    }
  }, [isAuthorized, currentPage, debouncedSearchTerm]);

  const fetchData = async (page: number, search: string = "") => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await apiClient.get(`/categories?page=${page}&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data, totalPages } = response.data;
      setCategories(data);
      setTotalPages(totalPages);
    } catch {
      toast.error("Gagal mengambil data kategori.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  if (!isAuthorized) {
    return <div className="flex items-center justify-center h-screen">Memeriksa otorisasi...</div>;
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
        <h1 className="text-3xl font-bold">Manajemen Kategori</h1>
        <Button onClick={handleAddClick}>Tambah Kategori</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cari kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nama Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.id.toString().substring(0, 8)}
                  </TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(category)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Tidak ada kategori ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
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
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index + 1}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(index + 1);
                    }}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
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

      {/* FORM TAMBAH/EDIT */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? `Mengedit kategori: ${editingCategory.name}`
                : "Isi form untuk kategori baru."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CategoryForm
              initialData={editingCategory}
              onSuccess={() => fetchData(currentPage)}
              setOpen={setIsDialogOpen}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
