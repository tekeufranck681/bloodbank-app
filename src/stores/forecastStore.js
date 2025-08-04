// src/stores/forecastStore.js
import { create } from "zustand";
import { forecastService } from "../services/forecastService";

export const useForecastStore = create((set, get) => ({
  currentDayPredictions: {},
  next7DaysPredictions: [],
  latestForecast: null,
  isLoading: false,
  error: null,

  // Clear error
  clearError: () => set({ error: null }),

  // Get current day predictions
  fetchCurrentDayPredictions: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await forecastService.predict();
      const { predictions } = result;
      
      set({
        currentDayPredictions: predictions,
        isLoading: false
      });
      
      return { predictions };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Get next 7 days predictions
  fetchNext7DaysPredictions: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await forecastService.predictNext7Days();
      const { predictions } = result;
      
      set({
        next7DaysPredictions: predictions,
        isLoading: false
      });
      
      return { predictions };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Get latest forecast
  fetchLatestForecast: async (period = "1d") => {
    set({ isLoading: true, error: null });
    try {
      const result = await forecastService.getLatestForecast(period);
      const { forecast } = result;
      
      set({
        latestForecast: forecast,
        isLoading: false
      });
      
      return { forecast };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Clear all forecast data
  clearForecastData: () => set({
    currentDayPredictions: {},
    next7DaysPredictions: [],
    latestForecast: null,
    error: null
  }),
}));
