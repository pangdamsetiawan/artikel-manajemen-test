// lib/axios.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://test-fe.mysellerpintar.com/api', // Base URL API dari dokumen tes [cite: 3]
  timeout: 10000, // Opsional: batas waktu request 10 detik
  headers: {
    'Content-Type': 'application/json',
    // Anda bisa menambahkan header lain di sini jika diperlukan
  },
});

// Opsional: Anda bisa menambahkan interceptor untuk menangani token otentikasi secara otomatis
// Misalnya, mengambil token dari local storage/cookies dan menambahkannya ke setiap request
apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('authToken'); // Contoh pengambilan token
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;