// src/stores/donorStore.js
import { create } from "zustand";
import { donorService } from "../services/donorService";

export const useDonorStore = create((set, get) => ({
  donors: [],
  selectedDonor: null,
  isLoading: false,
  error: null,
  filters: {
    is_eligible: undefined,
    skip: 0,
    limit: 20
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set selected donor
  setSelectedDonor: (donor) => set({ selectedDonor: donor }),

  // Set filters
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // Create a new donor
  createDonor: async (donorData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await donorService.create(donorData);
      const { donor } = result;
      
      // Add the new donor to the list
      set((state) => ({
        donors: [donor, ...state.donors],
        isLoading: false
      }));
      
      return { donor };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch all donors
  fetchDonors: async (customFilters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const filters = { ...get().filters, ...customFilters };
      const result = await donorService.getAll(filters);
      const { donors } = result;
      
      set({
        donors,
        isLoading: false,
        filters
      });
      
      return { donors };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch a single donor
  fetchDonor: async (donorId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await donorService.getById(donorId);
      const { donor } = result;
      
      set({
        selectedDonor: donor,
        isLoading: false
      });
      
      return { donor };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update a donor
  updateDonor: async (donorId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await donorService.update(donorId, updateData);
      const { donor } = result;
      
      // Update the donor in the list
      set((state) => ({
        donors: state.donors.map(d => d.id === donorId ? donor : d),
        selectedDonor: state.selectedDonor?.id === donorId ? donor : state.selectedDonor,
        isLoading: false
      }));
      
      return { donor };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete a donor
  deleteDonor: async (donorId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await donorService.delete(donorId);
      
      // Remove the donor from the list
      set((state) => ({
        donors: state.donors.filter(d => d.id !== donorId),
        selectedDonor: state.selectedDonor?.id === donorId ? null : state.selectedDonor,
        isLoading: false
      }));
      
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Search donors
  searchDonors: async (searchTerm, customFilters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const filters = { ...get().filters, ...customFilters };
      const result = await donorService.search(searchTerm, filters);
      const { donors } = result;
      
      set({
        donors,
        isLoading: false
      });
      
      return { donors };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Toggle donor eligibility
  toggleDonorEligibility: async (donorId) => {
    const donor = get().donors.find(d => d.id === donorId);
    if (!donor) return;

    try {
      const result = await get().updateDonor(donorId, {
        is_eligible: !donor.is_eligible
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get donors by blood type
  getDonorsByBloodType: (bloodType) => {
    const { donors } = get();
    return donors.filter(donor => donor.blood_type === bloodType);
  },

  // Get eligible donors count
  getEligibleDonorsCount: () => {
    const { donors } = get();
    return donors.filter(donor => donor.is_eligible).length;
  },

  // Get donors statistics
  getDonorsStats: () => {
    const { donors } = get();
    const total = donors.length;
    const eligible = donors.filter(d => d.is_eligible).length;
    const ineligible = total - eligible;
    
    const bloodTypeStats = donors.reduce((acc, donor) => {
      acc[donor.blood_type] = (acc[donor.blood_type] || 0) + 1;
      return acc;
    }, {});

    const genderStats = donors.reduce((acc, donor) => {
      acc[donor.gender] = (acc[donor.gender] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      eligible,
      ineligible,
      bloodTypeStats,
      genderStats
    };
  }
}));