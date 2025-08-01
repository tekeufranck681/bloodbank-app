// src/config/axiosConfigAuth.js
import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const AUTH_BASE_URL = `${import.meta.env.VITE_AUTH_BACKEND_URL}/auth`;

const api = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { logout } = useAuthStore.getState();
    const token = localStorage.getItem("token");
    const status = error.response?.status;

    // Only logout on 401 if we have a token and it's not a verify-token request
    if (status === 401 && token && !error.config?.url?.includes('/verify-token')) {
      console.log("Token expired during API call, logging out");
      logout();
    }

    return Promise.reject(error);
  }
);

export default api;
