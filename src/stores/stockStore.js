// src/stores/stockStore.js
import { create } from "zustand";
import { stockService } from "../services/stockService";

export const useStockStore = create((set, get) => ({
  stocks: [],
  selectedStock: null,
  isLoading: false,
  error: null,
  filters: {
    bloodType: 'all',
    status: 'all',
    location: 'all'
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set selected stock
  setSelectedStock: (stock) => set({ selectedStock: stock }),

  // Set filters
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // Fetch all stocks
  fetchStocks: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await stockService.getAll();
      const { stocks } = result;
      
      // Filter out any null/undefined stocks
      const validStocks = stocks.filter(stock => stock && stock.id);
      
      set({ stocks: validStocks, isLoading: false });
      return { stocks: validStocks };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch stock by ID
  fetchStockById: async (stockId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await stockService.getById(stockId);
      const { stock } = result;
      
      set({ selectedStock: stock, isLoading: false });
      return { stock };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update stock status
  updateStockStatus: async (stockId, status) => {
    set({ isLoading: true, error: null });
    try {
      const result = await stockService.updateStatus(stockId, status);
      const { stock } = result;
      
      // Update the stock in the list
      set((state) => ({
        stocks: state.stocks.map(s => 
          s.id === stockId ? stock : s
        ),
        selectedStock: state.selectedStock?.id === stockId ? stock : state.selectedStock,
        isLoading: false
      }));
      
      return { stock };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Reserve stock
  reserveStock: async (stockId) => {
    return get().updateStockStatus(stockId, "reserved");
  },

  // Mark stock as used
  markStockAsUsed: async (stockId) => {
    return get().updateStockStatus(stockId, "used");
  },

  // Mark stock as expired
  markStockAsExpired: async (stockId) => {
    return get().updateStockStatus(stockId, "expired");
  },

  // Make stock available
  makeStockAvailable: async (stockId) => {
    return get().updateStockStatus(stockId, "available");
  },

  // Get filtered stocks (computed)
  getFilteredStocks: () => {
    const { stocks, filters } = get();
    
    return stocks.filter(stock => {
      const matchesBloodType = filters.bloodType === 'all' || stock.blood_type === filters.bloodType;
      const matchesStatus = filters.status === 'all' || stock.status === filters.status;
      const matchesLocation = filters.location === 'all' || stock.location === filters.location;
      
      return matchesBloodType && matchesStatus && matchesLocation;
    });
  },

  // Get stock statistics (computed)
  getStockStats: () => {
    const { stocks } = get();
    
    const stats = {
      total: stocks.length,
      available: stocks.filter(s => s.status === 'available').length,
      reserved: stocks.filter(s => s.status === 'reserved').length,
      used: stocks.filter(s => s.status === 'used').length,
      expired: stocks.filter(s => s.status === 'expired').length,
      byBloodType: {}
    };

    // Calculate by blood type
    stocks.forEach(stock => {
      const bloodType = stock.blood_type || 'Unknown';
      if (!stats.byBloodType[bloodType]) {
        stats.byBloodType[bloodType] = {
          total: 0,
          available: 0,
          reserved: 0,
          used: 0,
          expired: 0
        };
      }
      stats.byBloodType[bloodType].total++;
      stats.byBloodType[bloodType][stock.status]++;
    });

    return stats;
  },

  // Get stocks expiring soon
  getExpiringStocks: (daysThreshold = 7) => {
    const { stocks } = get();
    const now = new Date();
    const threshold = new Date(now.getTime() + (daysThreshold * 24 * 60 * 60 * 1000));
    
    return stocks.filter(stock => {
      if (!stock.expiry_date || stock.status === 'expired' || stock.status === 'used') {
        return false;
      }
      
      const expiryDate = new Date(stock.expiry_date);
      return expiryDate <= threshold && expiryDate > now;
    });
  }
}));