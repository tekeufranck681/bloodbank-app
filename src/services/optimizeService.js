// src/services/optimizeService.js
import optimizeApi from "../config/axiosConfigOptimize";
import { toast } from "sonner";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  // Throw a normal Error with the message (not a nested object)
  throw new Error(message);
};

// Check if optimization data has meaningful values
const hasValidData = (optimizationData) => {
  if (!optimizationData || !optimizationData.data) {
    return false;
  }
  
  const data = optimizationData.data;
  
  const bloodTypeEntries = Object.entries(data)
    .filter(([key, value]) => typeof value === 'object' && value.recommended_order_bags !== undefined);
  
  if (bloodTypeEntries.length === 0) {
    return false;
  }
  
  // Check if all values are zero
  const hasNonZeroValues = bloodTypeEntries.some(([bloodType, values]) => {
    const hasValues = (values.recommended_order_bags > 0) || 
                     (values.emergency_needed_bags > 0) || 
                     (values.total_cost_xaf > 0);
    return hasValues;
  });
  
  return hasNonZeroValues;
};

export const optimizeService = {
  // Get optimization for specified period
  getOptimization: async (period = "1d") => {
    try {
      const response = await optimizeApi.get(`/optimize?period=${period}`);
      
      const optimization = response.data;
      
      // Validate data and show toast if invalid
      if (!hasValidData(optimization)) {
        toast.error('Service Issue', {
          description: 'Optimization service is having some issues. Please try again later.',
        });
      }
      
      return {
        optimization,
        success: true
      };
    } catch (error) {
      toast.error('Service Issue', {
        description: 'Optimization service is having some issues. Please try again later.',
      });
      normalizeError(error, "Failed to get optimization");
    }
  },

  // Get latest optimization by period
  getLatestOptimization: async (period = "1d") => {
    try {
      const response = await optimizeApi.get(`/optimization/latest?period=${period}`);
      
      const optimization = response.data;
      
      // Validate data and show toast if invalid
      if (!hasValidData(optimization)) {
        toast.error('Service Issue', {
          description: 'Optimization service is having some issues. Please try again later.',
        });
      }
      
      return {
        optimization,
        success: true
      };
    } catch (error) {
      toast.error('Service Issue', {
        description: 'Optimization service is having some issues. Please try again later.',
      });
      normalizeError(error, "Failed to get latest optimization");
    }
  },
};
