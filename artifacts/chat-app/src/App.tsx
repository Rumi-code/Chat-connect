import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { WebRTCProvider } from "@/hooks/use-webrtc";
import { SettingsProvider } from "@/hooks/use-settings";

import WelcomePage from "@/pages/welcome";
import ChatLayout from "@/pages/chat-layout";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoaded } = useAuth();
  
  if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <WelcomePage />;
  
  return (
    <WebSocketProvider>
      <WebRTCProvider>
        <Component />
      </WebRTCProvider>
    </WebSocketProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/welcome" component={WelcomePage} />
      <Route path="/c/:id">
        {() => <ProtectedRoute component={ChatLayout} />}
      </Route>
      <Route path="/ai/:id">
        {() => <ProtectedRoute component={ChatLayout} />}
      </Route>
      <Route path="/">
        {() => <ProtectedRoute component={ChatLayout} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
