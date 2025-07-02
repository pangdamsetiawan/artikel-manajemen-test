"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import Link from 'next/link';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Komponen Kartu Artikel
const ArticleCard = ({ article }) => {
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

export default function ArticlesPage() {
  const router = useRouter();
  const [allArticles, setAllArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          apiClient.get('/articles', { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get('/categories', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setAllArticles(articlesRes.data.data);
        setFilteredArticles(articlesRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        toast.error("Gagal mengambil data awal.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    let results = allArticles;

    if (selectedCategory && selectedCategory !== "all") {
      results = results.filter(article => article.category?.id === selectedCategory);
    }

    if (debouncedSearchTerm) {
      results = results.filter(article =>
        article.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    setFilteredArticles(results);
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, allArticles]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    toast.success("Logout berhasil.");
    router.push('/login');
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Daftar Artikel</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Input
          type="text"
          placeholder="Cari artikel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <Select
          onValueChange={(value) => setSelectedCategory(value)}
          value={selectedCategory}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories
              .filter(category => category.id && category.id !== "")
              .map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <main>
        {isLoading ? (
          <div className="text-center py-10"><p>Memuat...</p></div>
        ) : currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10"><p className="text-gray-500">Artikel tidak ditemukan.</p></div>
        )}
      </main>

      {totalPages > 1 && (
        <footer className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {[...Array(totalPages).keys()].map(number => (
                <PaginationItem key={number + 1}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(number + 1);
                    }}
                    isActive={currentPage === number + 1}
                  >
                    {number + 1}
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
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </footer>
      )}
    </div>
  );
}
