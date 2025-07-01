import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://test-fe.mysellerpintar.com/api',
  // Naikkan batas waktu menjadi 30 detik
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... sisa kode interceptor tetap sama ...
apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('authToken');
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