// src/services/donationService.js
import donationsApi from "../config/axiosConfigDonations";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  // Throw a normal Error with the message (not a nested object)
  throw new Error(message);
};

export const donationService = {
  // Create a new donation
  create: async (donationData, donorId) => {
    try {
      const params = new URLSearchParams();
      params.append('donor_id', donorId);
      
      console.log('=== CREATE DONATION DEBUG ===');
      console.log('Donation Data:', donationData);
      console.log('Donor ID:', donorId);
      console.log('Query params:', params.toString());
      console.log('============================');
      
      const response = await donationsApi.post(`/?${params.toString()}`, donationData);
      const { data } = response.data;
      return { donation: data };
    } catch (error) {
      normalizeError(error, "Failed to create donation");
    }
  },

  // Get all donations with optional filters
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.donor_id) {
        params.append('donor_id', filters.donor_id);
      }
      if (filters.skip !== undefined) {
        params.append('skip', filters.skip);
      }
      if (filters.limit !== undefined) {
        params.append('limit', filters.limit);
      }

      const queryString = params.toString();
      const url = queryString ? `/?${queryString}` : '/';

      const response = await donationsApi.get(url);
      const data = response.data;
      // API returns array directly, not wrapped in data object
      return { donations: Array.isArray(data) ? data : [data] };
    } catch (error) {
      normalizeError(error, "Failed to fetch donations");
    }
  },

  // Get a single donation by ID
  getById: async (donationId) => {
    try {
      const response = await donationsApi.get(`/${donationId}`);
      const data = response.data;
      return { donation: data };
    } catch (error) {
      normalizeError(error, "Failed to fetch donation");
    }
  },

  // Update a donation
  update: async (donationId, updateData) => {
    try {
      console.log('=== UPDATE DONATION DEBUG ===');
      console.log('Donation ID:', donationId);
      console.log('Update Data:', updateData);
      console.log('============================');
      
      const response = await donationsApi.put(`/${donationId}`, updateData);
      const data = response.data;
      return { donation: data };
    } catch (error) {
      normalizeError(error, "Failed to update donation");
    }
  },

  // Search donations by donor (client-side filtering for now)
  search: async (searchTerm, filters = {}) => {
    try {
      const { donations } = await donationService.getAll(filters);
      
      if (!searchTerm) return { donations };

      const filteredDonations = donations.filter(donation => 
        donation.donor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.collection_site?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.blood_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return { donations: filteredDonations };
    } catch (error) {
      normalizeError(error, "Failed to search donations");
    }
  },

  // Upload donations file
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('=== UPLOAD DONATIONS FILE DEBUG ===');
      console.log('File:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
      console.log('====================================');

      const response = await donationsApi.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      normalizeError(error, "Failed to upload donations file");
    }
  },
};
