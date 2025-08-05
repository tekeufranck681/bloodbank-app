// src/services/authService.js
import api from "../config/axiosConfigAuth";
import api1 from "../config/axiosConfigBloodManager";

const normalizeError = (error, fallbackMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallbackMessage;
  // Throw a normal Error with the message (not a nested object)
  throw new Error(message);
};

export const authService = {
  login: async ({ email, password, role }) => {
    try {
      const response = await api.post("/login", { email, password, role });
      const { access_token, token_type, user } = response.data.data;
      localStorage.setItem("token", access_token);
      return { user, access_token, token_type };
    } catch (error) {
      normalizeError(error, "Login failed");
    }
  },

  loginBloodManager: async ({ email, password }) => {
    try {
      const response = await api1.post("/login", { email, password });
      const { access_token, token_type, user } = response.data.data;
      localStorage.setItem("token", access_token);
      return { user, access_token, token_type };
    } catch (error) {
      normalizeError(error, "Blood manager login failed");
    }
  },

  validateToken: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // Try both APIs to validate token since we don't know user type yet
      let response;
      let isBloodManager = false;
      
      try {
        // First try auth API for admin users
        response = await api.post("/verify-token", {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (authError) {
        // If auth API fails, try blood manager API
        try {
          response = await api1.post("/verify-token", {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          isBloodManager = true;
        } catch (managerError) {
          // If both fail, throw the original auth error
          throw authError;
        }
      }
      
      if (response.data.status !== "success") {
        throw new Error("Token invalid or expired");
      }
      
      const user = response.data.data;
      return { user };
    } catch (error) {
      // Only remove token if it's actually invalid, not on network errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
      }
      normalizeError(error, "Token validation failed");
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem("token");
      return { message: "Logged out successfully" };
    } catch (error) {
      normalizeError(error, "Logout failed");
    }
  },
};
