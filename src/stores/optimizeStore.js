// src/stores/optimizeStore.js
import { create } from "zustand";
import { optimizeService } from "../services/optimizeService";

export const useOptimizeStore = create((set, get) => ({
  currentOptimization: null,
  latestOptimization: null,
  isLoading: false,
  error: null,

  // Clear error
  clearError: () => set({ error: null }),

  // Get optimization for specified period
  fetchOptimization: async (period = "1d") => {
    set({ isLoading: true, error: null });
    try {
      const result = await optimizeService.getOptimization(period);
      const { optimization } = result;
      
      set({
        currentOptimization: optimization,
        isLoading: false
      });
      
      return { optimization };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Get latest optimization
  fetchLatestOptimization: async (period = "1d") => {
    set({ isLoading: true, error: null });
    try {
      const result = await optimizeService.getLatestOptimization(period);
      const { optimization } = result;
      
      set({
        latestOptimization: optimization,
        isLoading: false
      });
      
      return { optimization };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Clear all optimization data
  clearOptimizationData: () => set({
    currentOptimization: null,
    latestOptimization: null,
    error: null
  }),
}));
