"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/axios";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// ==========================
// Schema & Tipe Data
// ==========================
interface Category {
  id: string | number;
  name: string;
}

const articleFormSchema = z.object({
  title: z.string().min(5, { message: "Judul minimal 5 karakter." }),
  content: z.string().min(20, { message: "Konten minimal 20 karakter." }),
  categoryId: z.string().min(1, { message: "Harap pilih kategori." }),
});

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [previewContent, setPreviewContent] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const form = useForm<z.infer<typeof articleFormSchema>>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
    },
  });

  // ==========================
  // Load data artikel & kategori
  // ==========================
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!id || !token) return;

    apiClient.get(`/articles/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const article = res.data;
        form.reset({
          title: article.title,
          content: article.content,
          categoryId: article.categoryId?.toString() || "",
        });
      })
      .catch(() => toast.error("Gagal memuat data artikel."));

    apiClient.get("/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCategories(res.data.data.filter((c: Category) => c.id)))
      .catch(() => toast.error("Gagal memuat daftar kategori."));
  }, [id, form]);

  const handlePreview = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.warning("Isi semua field sebelum melihat preview.");
      return;
    }

    setPreviewContent(form.getValues().content);
    setIsPreviewOpen(true);
  };

  // ==========================
  // Submit Form
  // ==========================
  const onSubmit = async (values: z.infer<typeof articleFormSchema>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await apiClient.put(`/articles/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Artikel berhasil diperbarui!");
      router.push("/dashboard/articles");
    } catch {
      toast.error("Gagal memperbarui artikel.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <Button asChild variant="ghost" className="mb-6 px-0 hover:text-primary">
          <Link href="/dashboard/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Manajemen Artikel
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-6">Edit Artikel</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Judul */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Artikel</FormLabel>
                  <FormControl>
                    <Input placeholder="Judul artikel Anda..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kategori */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori untuk artikel ini" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Konten */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konten Artikel (format HTML)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis konten artikel dalam format HTML..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={handlePreview}>
                Preview
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Memperbarui..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Modal Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Artikel</DialogTitle>
            <DialogDescription>
              Ini tampilan artikel berdasarkan konten HTML.
            </DialogDescription>
          </DialogHeader>
          <div
            className="py-4 overflow-y-auto prose lg:prose-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
