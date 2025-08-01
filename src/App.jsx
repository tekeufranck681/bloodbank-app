import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, isAuthLoading, initializeAuth } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    console.log("App mounting, initializing auth...");
    console.log("Initial auth state:", { isAuthenticated, isAuthLoading });
    
    initializeAuth().then(() => {
      console.log("Auth initialization complete");
      const finalState = useAuthStore.getState();
      console.log("Final auth state:", { 
        isAuthenticated: finalState.isAuthenticated, 
        isAuthLoading: finalState.isAuthLoading,
        user: finalState.user 
      });
    }).catch((error) => {
      console.error("Auth initialization error:", error);
      const errorState = useAuthStore.getState();
      console.log("Error auth state:", { 
        isAuthenticated: errorState.isAuthenticated, 
        isAuthLoading: errorState.isAuthLoading 
      });
    });
  }, [initializeAuth]);

  // Log state changes
  useEffect(() => {
    console.log("Auth state changed:", { isAuthenticated, isAuthLoading });
  }, [isAuthenticated, isAuthLoading]);

  // Show loading spinner while checking authentication
  if (isAuthLoading) {
    console.log("App is loading auth state...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-medical-red/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
