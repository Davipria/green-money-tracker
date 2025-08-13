import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import { lazy, Suspense, useState } from "react";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Archive = lazy(() => import("./pages/Archive"));
const AddBet = lazy(() => import("./pages/AddBet"));
const Analysis = lazy(() => import("./pages/Analysis"));
const Profile = lazy(() => import("./pages/Profile"));
const Tipsters = lazy(() => import("./pages/Tipsters"));
const TipsterDetail = lazy(() => import("./pages/TipsterDetail"));
const Auth = lazy(() => import("./pages/Auth"));
const Landing = lazy(() => import("./pages/Landing"));
const NotFound = lazy(() => import("./pages/NotFound"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse space-y-6">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  useAuthErrorHandler();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="archive" element={<Archive />} />
          <Route path="add-bet" element={<AddBet />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="tipsters" element={<Tipsters />} />
          <Route path="tipsters/:tipsterId" element={<TipsterDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  // Crea il QueryClient all'interno del componente per evitare problemi di inizializzazione
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
