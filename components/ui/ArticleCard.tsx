"use client";

import Link from "next/link";
import Image from "next/image"; // 1. Impor komponen Image
import React from 'react';

interface Article {
  id: string | number;
  title: string;
  content: string;
  imageUrl?: string;
}

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  if (!article) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* 2. Ganti <img> dengan <Image /> */}
      <Image
        src={article.imageUrl || `https://source.unsplash.com/random/400x225?sig=${article.id}`}
        alt={article.title}
        width={400} // 3. Tambahkan width
        height={225} // 4. Tambahkan height
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 truncate">{article.title}</h3>
        <p className="text-gray-600 text-sm mb-4 truncate">
          {article.content}
        </p>
        <Link href={`/articles/${article.id}`}>
          <span className="text-blue-600 hover:underline font-semibold">
            Baca Selengkapnya →
          </span>
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;