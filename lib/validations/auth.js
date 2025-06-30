import * as z from 'zod';

// Skema untuk form Register (SUDAH DIPERBAIKI)
export const registerSchema = z.object({
  // --- UBAH BAGIAN INI ---
  username: z.string().min(3, { message: 'Username harus memiliki minimal 3 karakter.' }),
  // -----------------------
  email: z.string().email({ message: 'Harap masukkan alamat email yang valid.' }),
  password: z.string().min(6, { message: 'Password harus memiliki minimal 6 karakter.' }),
});

// Skema untuk form Login (YANG PERLU DIPERBAIKI)
export const loginSchema = z.object({
  // --- UBAH BAGIAN INI ---
  username: z.string().min(1, { message: "Username tidak boleh kosong." }),
  // -----------------------
  password: z.string().min(1, { message: 'Password tidak boleh kosong.' }),
});