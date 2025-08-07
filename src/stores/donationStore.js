// src/stores/donationStore.js
import { create } from "zustand";
import { donationService } from "../services/donationService";

export const useDonationStore = create((set, get) => ({
  donations: [],
  selectedDonation: null,
  isLoading: false,
  error: null,
  filters: {
    donor_id: undefined,
    skip: 0,
    limit: 20
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set selected donation
  setSelectedDonation: (donation) => set({ selectedDonation: donation }),

  // Set filters
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // Fetch all donations
  fetchDonations: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await donationService.getAll({ ...get().filters, ...filters });
      const { donations } = result;
      
      // Filter out any null/undefined donations
      const validDonations = donations.filter(donation => donation && donation.donation_id);
      
      set({ donations: validDonations, isLoading: false });
      return { donations: validDonations };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Search donations
  searchDonations: async (query, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await donationService.search(query, { ...get().filters, ...filters });
      const { donations } = result;
      
      // Filter out any null/undefined donations
      const validDonations = donations.filter(donation => donation && donation.donation_id);
      
      set({ donations: validDonations, isLoading: false });
      return { donations: validDonations };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Create a new donation
  createDonation: async (donationData, donorId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await donationService.create(donationData, donorId);
      const { donation } = result;
      
      // Add null check and ensure donation is valid before adding to state
      if (donation && donation.donation_id) {
        set((state) => ({
          donations: [donation, ...state.donations],
          isLoading: false
        }));
      } else {
        console.warn('Invalid donation object received:', donation);
        set({ isLoading: false });
      }
      
      return { donation };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update a donation
  updateDonation: async (donationId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await donationService.update(donationId, updateData);
      const { donation } = result;
      
      // Update the donation in the list
      set((state) => ({
        donations: state.donations.map(d => 
          d.donation_id === donationId ? donation : d
        ),
        selectedDonation: state.selectedDonation?.donation_id === donationId ? donation : state.selectedDonation,
        isLoading: false
      }));
      
      return { donation };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete a donation
  deleteDonation: async (donationId) => {
    set({ isLoading: true, error: null });
    try {
      await donationService.delete(donationId);
      
      set((state) => ({
        donations: state.donations.filter(d => d.donation_id !== donationId),
        selectedDonation: state.selectedDonation?.donation_id === donationId ? null : state.selectedDonation,
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Get donations by donor ID
  getDonationsByDonor: async (donorId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await donationService.getAll({ donor_id: donorId });
      const { donations } = result;
      
      set({
        donations,
        isLoading: false
      });
      
      return { donations };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Clear donations (useful when switching contexts)
  clearDonations: () => set({ donations: [], selectedDonation: null }),

  // Upload donations file
  uploadDonationsFile: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const result = await donationService.uploadFile(file);
      
      // Refresh donations list after successful upload
      await get().fetchDonations();
      
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));
