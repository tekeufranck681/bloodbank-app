// src/services/forecastService.js
import forecastApi from "../config/axiosConfigForecast";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  // Throw a normal Error with the message (not a nested object)
  throw new Error(message);
};

export const forecastService = {
  // Get current day prediction
  predict: async () => {
    try {
      const response = await forecastApi.get("/predict");
      return {
        predictions: response.data,
        success: true
      };
    } catch (error) {
      normalizeError(error, "Failed to get current day prediction");
    }
  },

  // Get next 7 days prediction
  predictNext7Days: async () => {
    try {
      const response = await forecastApi.get("/predict/next-7-days");
      return {
        predictions: response.data.predictions,
        success: true
      };
    } catch (error) {
      normalizeError(error, "Failed to get 7-day forecast");
    }
  },

  // Get latest forecast
  getLatestForecast: async (period = "1d") => {
    try {
      const response = await forecastApi.get(`/forecast/latest?period=${period}`);
      console.log('Forecast service response:', response.data); // Debug log
      
      // Based on your API response structure
      if (period === "1d") {
        // For 1d: { "status": "success", "data": { "A+": 1302.98, ... } }
        return {
          forecast: response.data.data,
          success: true
        };
      } else {
        // For 7d: { "status": "success", "data": [{ date, blood_type, predicted_volume }, ...] }
        return {
          forecast: response.data.data,
          success: true
        };
      }
    } catch (error) {
      console.error('Forecast service error:', error);
      normalizeError(error, "Failed to get latest forecast");
    }
  },
};
