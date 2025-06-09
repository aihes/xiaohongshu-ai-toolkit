
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CreditsProvider } from "@/hooks/useCredits";
import { SentryErrorBoundary } from "@/lib/sentry";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import TransactionHistory from "./pages/TransactionHistory";
import PaperAnalyzer from "./pages/PaperAnalyzer";
import CreditStore from "./components/CreditStore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <SentryErrorBoundary
    fallback={({ error, resetError }) => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">出现了错误</h1>
          <p className="text-gray-600 mb-4">很抱歉，应用遇到了问题</p>
          <button
            onClick={resetError}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    )}
    showDialog={false}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CreditsProvider>
              <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/payment-success" element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } />
              <Route path="/credits" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
                    <CreditStore />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <TransactionHistory />
                </ProtectedRoute>
              } />
              <Route path="/paper-analyzer" element={
                <ProtectedRoute>
                  <PaperAnalyzer />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </CreditsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </SentryErrorBoundary>
);

export default App;
