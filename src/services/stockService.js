// src/services/stockService.js
import stockApi from "../config/axiosConfigStock";

export const stockService = {
  // Get all stocks
  getAll: async () => {
    try {
      const response = await stockApi.get("/");
      return {
        stocks: response.data,
        success: true
      };
    } catch (error) {
      console.error("Error fetching stocks:", error);
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Failed to fetch stocks"
      );
    }
  },

  // Get stock by ID
  getById: async (stockId) => {
    try {
      const response = await stockApi.get(`/${stockId}`);
      return {
        stock: response.data,
        success: true
      };
    } catch (error) {
      console.error("Error fetching stock:", error);
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Failed to fetch stock"
      );
    }
  },

  // Update stock status
  updateStatus: async (stockId, status) => {
    try {
      const response = await stockApi.patch(`/${stockId}/status`, {
        status: status
      });
      return {
        stock: response.data,
        success: true
      };
    } catch (error) {
      console.error("Error updating stock status:", error);
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        "Failed to update stock status"
      );
    }
  },

  // Reserve stock (convenience method)
  reserve: async (stockId) => {
    return stockService.updateStatus(stockId, "reserved");
  },

  // Mark stock as used (convenience method)
  markAsUsed: async (stockId) => {
    return stockService.updateStatus(stockId, "used");
  },

  // Mark stock as expired (convenience method)
  markAsExpired: async (stockId) => {
    return stockService.updateStatus(stockId, "expired");
  },

  // Make stock available (convenience method)
  makeAvailable: async (stockId) => {
    return stockService.updateStatus(stockId, "available");
  }
};