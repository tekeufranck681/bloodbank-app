// src/services/managerService.js
import api1 from "../config/axiosConfigBloodManager";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  // Throw a normal Error with the message (not a nested object)
  throw new Error(message);
};

export const managerService = {
  // Register a new blood manager (admin only)
  register: async ({ email, full_name, phone_number, password }) => {
    try {
      const response = await api1.post("/register", { 
        email, 
        full_name, 
        phone_number, 
        password 
      });
      const { data } = response.data;
      return { manager: data };
    } catch (error) {
      normalizeError(error, "Manager registration failed");
    }
  },

  // Get all blood managers (admin only)
  getAll: async () => {
    try {
      const response = await api1.get("/");
      const { data } = response.data;
      return { managers: data };
    } catch (error) {
      normalizeError(error, "Failed to fetch managers");
    }
  },

  // Get a specific blood manager by ID
  getById: async (managerId) => {
    try {
      const response = await api1.get(`/${managerId}`);
      const { data } = response.data;
      return { manager: data };
    } catch (error) {
      normalizeError(error, "Failed to fetch manager");
    }
  },

  // Update a blood manager
  update: async (managerId, updateData) => {
    try {
      const response = await api1.put(`/${managerId}`, updateData);
      const { data } = response.data;
      return { manager: data };
    } catch (error) {
      normalizeError(error, "Manager update failed");
    }
  },
};