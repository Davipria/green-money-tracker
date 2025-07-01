import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/hooks/useAuth";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserMenu from "@/components/UserMenu";
import Dashboard from "./pages/Dashboard";
import Archive from "./pages/Archive";
import AddBet from "./pages/AddBet";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";
import Tipsters from "./pages/Tipsters";
import TipsterDetail from "./pages/TipsterDetail";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Ranking from "./pages/Ranking";
import { useState } from "react";

const AppContent = () => {
  useAuthErrorHandler();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/app" element={
        <ProtectedRoute>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="p-2 flex justify-between items-center">
                  <SidebarTrigger />
                  <UserMenu />
                </div>
                <Dashboard />
              </main>
            </div>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/app/archive" element={
        <ProtectedRoute>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="p-2 flex justify-between items-center">
                  <SidebarTrigger />
                  <UserMenu />
                </div>
                <Archive />
              </main>
            </div>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/app/add-bet" element={
        <ProtectedRoute>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="p-2 flex justify-between items-center">
                  <SidebarTrigger />
                  <UserMenu />
                </div>
                <AddBet />
              </main>
            </div>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/app/analysis" element={
        <ProtectedRoute>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="p-2 flex justify-between items-center">
                  <SidebarTrigger />
                  <UserMenu />
                </div>
                <Analysis />
              </main>
            </div>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/app/tipsters" element={
        <ProtectedRoute>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="p-2 flex justify-between items-center">
                  <SidebarTrigger />
                  <UserMenu />
                </div>
                <Tipsters />
              </main>
            </div>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/app/tipsters/:tipsterId" element={
        <ProtectedRoute>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="p-2 flex justify-between items-center">
                  <SidebarTrigger />
                  <UserMenu />
                </div>
                <TipsterDetail />
              </main>
            </div>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/app/profile" element={
        <ProtectedRoute>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="p-2 flex justify-between items-center">
                  <SidebarTrigger />
                  <UserMenu />
                </div>
                <Profile />
              </main>
            </div>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/app/ranking" element={
        <ProtectedRoute>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="p-2 flex justify-between items-center">
                  <SidebarTrigger />
                  <UserMenu />
                </div>
                <Ranking />
              </main>
            </div>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      {/* Redirect any /profile to /app/profile */}
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
