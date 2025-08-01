// src/stores/authStore.js
import { create } from "zustand";
import { authService } from "../services/authService";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthLoading: false, 
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // Determine which service method to call based on role
      let result;
      if (credentials.role === 'admin') {
        result = await authService.login(credentials);
        
      } else {
        result = await authService.loginBloodManager(credentials);
      }
      
      const { user, access_token } = result;
      set({ user, isAuthenticated: true, isLoading: false });
      return { user, access_token };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error.message);
    } finally {
      set({ user: null, isAuthenticated: false, error: null, isAuthLoading: false });
    }
  },

  checkAuth: async () => {
    const currentState = get();
    
    // Don't check if already checking
    if (currentState.isAuthLoading) {
      return currentState.isAuthenticated;
    }

    set({ isAuthLoading: true });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        set({ user: null, isAuthenticated: false, isAuthLoading: false });
        return false;
      }

      const { user } = await authService.validateToken();
      set({ user, isAuthenticated: true, isAuthLoading: false });
      return true;
    } catch (error) {
      console.error("Auth check failed:", error.message);
      // Always set isAuthLoading to false regardless of error type
      if (error.message.includes("invalid") || error.message.includes("expired")) {
        localStorage.removeItem("token");
        set({ user: null, isAuthenticated: false, isAuthLoading: false });
      } else {
        // Network error - keep current state but stop loading
        set({ isAuthLoading: false });
      }
      return false;
    }
  },

  // Initialize auth state on store creation
  initializeAuth: async () => {
    console.log("initializeAuth: Starting...");
    set({ isAuthLoading: true });
    
    try {
      const token = localStorage.getItem("token");
      console.log("initializeAuth: Token exists:", !!token);
      
      if (token) {
        // Call checkAuth but don't let it set isAuthLoading again
        const currentState = get();
        if (currentState.isAuthLoading) {
          try {
            const { user } = await authService.validateToken();
            console.log("initializeAuth: Token valid, user:", user);
            set({ user, isAuthenticated: true, isAuthLoading: false });
          } catch (error) {
            console.error("initializeAuth: Token validation failed:", error.message);
            if (error.message.includes("invalid") || error.message.includes("expired")) {
              localStorage.removeItem("token");
            }
            set({ user: null, isAuthenticated: false, isAuthLoading: false });
          }
        }
      } else {
        console.log("initializeAuth: No token, setting unauthenticated");
        set({ 
          user: null, 
          isAuthenticated: false, 
          isAuthLoading: false 
        });
      }
    } catch (error) {
      console.error("initializeAuth: Unexpected error:", error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isAuthLoading: false 
      });
    }
    
    console.log("initializeAuth: Complete, final state:", get());
  },

  clearError: () => set({ error: null }),
}));
