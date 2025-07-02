"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { loginSchema } from '@/lib/validations/auth';
import apiClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', data);

      const token = response.data.token;
      const username = response.data.username || data.username;
      const role = response.data.role || "User"; // ✅ Ambil langsung dari backend

      if (token && role) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('username', username);
        localStorage.setItem('userRole', role); // optional: bisa digunakan di frontend

        toast.success("Login berhasil!");

        // ✅ Redirect berdasarkan role dari backend
        if (role === "Admin") {
          router.push("/dashboard");
        } else {
          router.push("/articles");
        }
      } else {
        toast.error("Login berhasil, tetapi data tidak lengkap.");
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login gagal. Periksa kembali kredensial Anda.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Masukkan username dan password Anda untuk mengakses akun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Login"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:underline">
              Register di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
