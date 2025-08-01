// src/services/donorService.js
import donorsApi from "../config/axiosConfigDonors";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  // Throw a normal Error with the message (not a nested object)
  throw new Error(message);
};

export const donorService = {
  // Create a new donor
  create: async (donorData) => {
    try {
      const response = await donorsApi.post("/", donorData);
      const { data } = response.data;
      return { donor: data };
    } catch (error) {
      normalizeError(error, "Failed to create donor");
    }
  },

  // Get all donors with optional filters
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.is_eligible !== undefined) {
        params.append('is_eligible', filters.is_eligible);
      }
      if (filters.skip !== undefined) {
        params.append('skip', filters.skip);
      }
      if (filters.limit !== undefined) {
        params.append('limit', filters.limit);
      }

      const response = await donorsApi.get(`/?${params.toString()}`);
      const { data } = response.data;
      return { donors: data };
    } catch (error) {
      normalizeError(error, "Failed to fetch donors");
    }
  },

  // Get a single donor by ID
  getById: async (donorId) => {
    try {
      const response = await donorsApi.get(`/${donorId}`);
      const { data } = response.data;
      return { donor: data };
    } catch (error) {
      normalizeError(error, "Failed to fetch donor");
    }
  },

  // Update a donor
  update: async (donorId, updateData) => {
    try {
      const response = await donorsApi.put(`/${donorId}`, updateData);
      const { data } = response.data;
      return { donor: data };
    } catch (error) {
      normalizeError(error, "Failed to update donor");
    }
  },

  // Delete a donor
  delete: async (donorId) => {
    try {
      const response = await donorsApi.delete(`/${donorId}`);
      const { data } = response.data;
      return { message: data.message };
    } catch (error) {
      normalizeError(error, "Failed to delete donor");
    }
  },

  // Search donors (client-side filtering for now)
  search: async (searchTerm, filters = {}) => {
    try {
      const { donors } = await donorService.getAll(filters);
      
      if (!searchTerm) return { donors };

      const filteredDonors = donors.filter(donor => 
        donor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.phone?.includes(searchTerm) ||
        donor.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return { donors: filteredDonors };
    } catch (error) {
      normalizeError(error, "Failed to search donors");
    }
  }
};