import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',  // empty = use Next.js rewrites
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

//  Request interceptor — attach auth token if present 
axiosInstance.interceptors.request.use(
  (config) => {
    // Partner's auth slice will store the token — read it from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

//  Response interceptor — handle global errors 
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    console.error('[Axios Error]', message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
