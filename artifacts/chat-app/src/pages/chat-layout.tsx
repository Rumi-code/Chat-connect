import { Switch, Route } from "wouter";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatArea } from "@/components/chat-area";
import { AiChatArea } from "@/components/ai-chat-area";
import { VideoCallOverlay } from "@/components/video-call-overlay";
import { Bot, Sparkles } from "lucide-react";

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="w-24 h-24 bg-card border border-white/5 rounded-3xl shadow-2xl flex items-center justify-center mb-8 rotate-12 relative">
        <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-accent animate-pulse" />
        <Bot className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-4xl font-display font-bold mb-4 z-10">Nexus Platform</h2>
      <p className="text-lg text-muted-foreground max-w-md text-center z-10">
        Select a conversation from the sidebar or start a new chat with our intelligent AI assistant.
      </p>
    </div>
  );
}

export default function ChatLayout() {
  return (
    <div className="flex h-[100dvh] w-full bg-sidebar overflow-hidden text-foreground selection:bg-primary/30">
      <AppSidebar />
      <main className="flex-1 flex flex-col relative min-w-0 bg-background md:rounded-l-[2rem] overflow-hidden border-l border-white/10 shadow-2xl z-20">
        <Switch>
          <Route path="/" component={EmptyState} />
          <Route path="/c/:id" component={ChatArea} />
          <Route path="/ai/:id" component={AiChatArea} />
        </Switch>
      </main>
      <VideoCallOverlay />
    </div>
  );
}
