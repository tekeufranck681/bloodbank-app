// src/stores/managerStore.js
import { create } from "zustand";
import { managerService } from "../services/managerService";

export const useManagerStore = create((set, get) => ({
  managers: [],
  selectedManager: null,
  isLoading: false,
  error: null,

  // Clear error
  clearError: () => set({ error: null }),

  // Set selected manager
  setSelectedManager: (manager) => set({ selectedManager: manager }),

  // Register a new blood manager
  registerManager: async (managerData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await managerService.register(managerData);
      const { manager } = result;
      
      // Add the new manager to the list
      set((state) => ({
        managers: [...state.managers, manager],
        isLoading: false
      }));
      
      return { manager };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch all managers
  fetchManagers: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await managerService.getAll();
      const { managers } = result;
      
      set({ managers, isLoading: false });
      return { managers };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch a specific manager by ID
  fetchManagerById: async (managerId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await managerService.getById(managerId);
      const { manager } = result;
      
      set({ selectedManager: manager, isLoading: false });
      return { manager };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update a manager
  updateManager: async (managerId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await managerService.update(managerId, updateData);
      const { manager } = result;
      
      // Update the manager in the list
      set((state) => ({
        managers: state.managers.map(m => 
          m.id === managerId ? manager : m
        ),
        selectedManager: state.selectedManager?.id === managerId ? manager : state.selectedManager,
        isLoading: false
      }));
      
      return { manager };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Clear managers list
  clearManagers: () => set({ managers: [], selectedManager: null }),

  // Remove manager from local state (for optimistic updates)
  removeManagerFromState: (managerId) => {
    set((state) => ({
      managers: state.managers.filter(m => m.id !== managerId),
      selectedManager: state.selectedManager?.id === managerId ? null : state.selectedManager
    }));
  },
}));