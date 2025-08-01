// src/config/axiosConfigDonors.js
import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const DONORS_BASE_URL = `${import.meta.env.VITE_MANAGER_BACKEND_URL}/donors`;

const donorsApi = axios.create({
  baseURL: DONORS_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

donorsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

donorsApi.interceptors.response.use(
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

export default donorsApi;