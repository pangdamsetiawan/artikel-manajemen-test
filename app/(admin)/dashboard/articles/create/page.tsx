"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Definisikan tipe dan skema validasi
interface Category {
  id: string | number;
  name: string;
}

const articleFormSchema = z.object({
  title: z.string().min(5, { message: "Judul minimal 5 karakter." }),
  content: z.string().min(20, { message: "Konten minimal 20 karakter." }),
  category_id: z.string().min(1, { message: "Harap pilih kategori." }),
});

export default function CreateArticlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [previewContent, setPreviewContent] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    apiClient
      .get("/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCategories(res.data.data))
      .catch(() => toast.error("Gagal memuat daftar kategori."));
  }, []);

  const form = useForm<z.infer<typeof articleFormSchema>>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category_id: "",
    },
  });

  const handlePreview = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.warning("Harap isi semua field yang diperlukan sebelum melihat preview.");
      return;
    }
    const values = form.getValues();
    setPreviewContent(values.content);
    setIsPreviewOpen(true);
  };

  async function onSubmit(values: z.infer<typeof articleFormSchema>) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        title: values.title,
        content: values.content, // HTML akan dikirim apa adanya
        categoryId: values.category_id,
      };

      await apiClient.post("/articles", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Artikel baru berhasil dibuat!");
      router.push("/dashboard/articles");
    } catch {
      toast.error("Gagal membuat artikel baru.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <Button asChild variant="ghost" className="mb-6 px-0 hover:text-primary">
          <Link href="/dashboard/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Manajemen Artikel
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-6">Buat Artikel Baru</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori untuk artikel ini" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories
                        .filter((category) => category.id)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konten Artikel (Format HTML)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis konten HTML Anda di sini..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={handlePreview}>
                Preview
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Artikel"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* === PREVIEW HTML === */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Artikel</DialogTitle>
            <DialogDescription>
              Ini adalah tampilan bagaimana artikel Anda akan terlihat saat dipublikasikan.
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
