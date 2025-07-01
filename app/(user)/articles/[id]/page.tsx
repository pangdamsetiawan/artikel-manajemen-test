'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button'; // Impor komponen Button
import { ArrowLeft } from 'lucide-react'; // Impor ikon

// Definisikan tipe untuk objek artikel
interface Article {
  id: string | number;
  title: string;
  content: string;
  imageUrl?: string;
  category_id?: number;
  Category?: {
    name: string;
  };
}

// Komponen kartu artikel lainnya
interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  if (!article) return null;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Image
        src={article.imageUrl || `https://picsum.photos/seed/${article.id}/400/225`}
        alt={article.title}
        width={400}
        height={225}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 truncate">{article.title}</h3>
        <p className="text-gray-600 text-sm mb-4 truncate">{article.content}</p>
        <Link href={`/articles/${article.id}`}>
          <span className="text-blue-600 hover:underline font-semibold">Baca Selengkapnya →</span>
        </Link>
      </div>
    </div>
  );
};

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [otherArticles, setOtherArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchArticleData = async () => {
      setIsLoading(true);
      try {
        const [mainArticleRes, allArticlesRes] = await Promise.all([
          apiClient.get(`/articles/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get('/articles', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const mainArticle: Article = mainArticleRes.data;
        const allArticles: Article[] = allArticlesRes.data.data;

        setArticle(mainArticle);

        if (mainArticle && mainArticle.category_id) {
          const relatedArticles = allArticles
            .filter(a => a.category_id === mainArticle.category_id && a.id != mainArticle.id)
            .slice(0, 3);
          setOtherArticles(relatedArticles);
        }
      } catch (err: unknown) {
        let message = "Gagal mengambil data artikel.";
        if (err instanceof AxiosError) {
          message = err.response?.data?.message || "Artikel dengan ID ini tidak ditemukan.";
        }
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArticleData();
    }
  }, [id, router]);

  if (isLoading) {
    return <div className="text-center py-20">Memuat artikel...</div>;
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Artikel tidak ditemukan</h2>
        <p>Mungkin artikel telah dihapus atau URL tidak valid.</p>
        <Link href="/articles">
          <span className="mt-4 inline-block text-blue-600 hover:underline">
            ← Kembali ke daftar artikel
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* ## Tombol "Kembali" yang Sudah Diperbaiki ## */}
        <Button asChild variant="ghost" className="mb-8 px-0 text-blue-600 hover:text-blue-700">
          <Link href="/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke daftar artikel
          </Link>
        </Button>
        <article>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{article.title}</h1>
          <p className="text-gray-500 mb-2">
            Kategori: <span className="font-semibold">{article.Category?.name || 'Tidak ada kategori'}</span>
          </p>
          <div className="relative w-full h-64 md:h-96 my-8">
            <Image
              src={article.imageUrl || `https://picsum.photos/seed/${article.id}/800/400`}
              alt={article.title}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div
            className="prose lg:prose-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </div>

      {otherArticles.length > 0 && (
        <aside className="mt-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Artikel Lainnya di Kategori yang Sama</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherArticles.map(other => (
              <ArticleCard key={other.id} article={other} />
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}