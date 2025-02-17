import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MarketIntelligencePage from "@/pages/market-intelligence";
import AIStrategyPage from "@/pages/ai-strategy";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/market-intelligence" component={MarketIntelligencePage} />
      <ProtectedRoute path="/ai-strategy" component={AIStrategyPage} />
      <ProtectedRoute path="/execution" component={() => <div>Execution Automation</div>} />
      <ProtectedRoute path="/simulations" component={() => <div>Decision Simulations</div>} />
      <ProtectedRoute path="/integrations" component={() => <div>API Integrations</div>} />
      <ProtectedRoute path="/settings" component={() => <div>Settings</div>} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}