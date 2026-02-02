import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SetupProvider, useSetup } from "@/contexts/SetupContext";
import { SetupWizard } from "@/components/setup/SetupWizard";
import Index from "./pages/Index";
import Setup from "./pages/Setup";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente que decide si mostrar el wizard o la app
function AppContent() {
  const { listo, verificando } = useSetup();
  
  // Mientras verifica, mostrar el wizard (que tiene su propio estado de carga)
  if (!listo || verificando) {
    return <SetupWizard />;
  }
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SetupProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </SetupProvider>
    </QueryClientProvider>
  );
}

export default App;
