import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // Impor Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Manajemen Artikel",
  description: "Test Frontend Developer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors /> {/* Tambahkan ini */}
      </body>
    </html>
  );
}