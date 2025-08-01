// src/config/axiosConfigStock.js
import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const STOCK_BASE_URL = `${import.meta.env.VITE_MANAGER_BACKEND_URL}/stocks`;

const stockApi = axios.create({
  baseURL: STOCK_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

stockApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

stockApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const { logout } = useAuthStore.getState();
    const token = localStorage.getItem("token");
    const status = error.response?.status;

    if (status === 401 && token) {
      logout(); // Only logout if there was a token and it failed
    }

    return Promise.reject(error); // Let the service/store handle the error
  }
);

export default stockApi;