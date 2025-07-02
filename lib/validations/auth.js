import * as z from 'zod';

// ✅ Validasi untuk form register
export const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username minimal 3 karakter.' }),
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
  role: z.enum(['USER', 'ADMIN'], {
    required_error: 'Role wajib dipilih.',
  }),
});

// ✅ Validasi untuk form login
export const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username tidak boleh kosong.' }),
  password: z.string().min(1, { message: 'Password tidak boleh kosong.' }),
});
