import { useState } from "react";
import { Switch, Route } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatArea } from "@/components/chat-area";
import { AiChatArea } from "@/components/ai-chat-area";
import { VideoCallOverlay } from "@/components/video-call-overlay";
import { NexusLogo } from "@/components/nexus-logo";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-background"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: 12 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-card border border-white/5 rounded-3xl shadow-2xl flex items-center justify-center mb-8 relative"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-accent" />
        </motion.div>
        <NexusLogo size={44} showText={false} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="text-4xl font-display font-bold mb-4 z-10"
      >
        Flare
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-lg text-muted-foreground max-w-md text-center z-10 px-4"
      >
        Select a conversation from the sidebar or start a new chat with our intelligent AI assistant.
      </motion.p>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full bg-sidebar overflow-hidden text-foreground selection:bg-primary/30">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative min-w-0 bg-background md:rounded-l-[2rem] overflow-hidden border-l border-white/10 shadow-2xl z-20">
        <div className="h-14 px-4 flex items-center gap-3 border-b border-white/5 md:hidden bg-card/40 backdrop-blur-md shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl hover:bg-white/10"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <NexusLogo size={28} />
        </div>

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
