import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatArea } from "@/components/chat-area";
import { MessageSquareText } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatPage() {
  const { username, isLoaded, logout } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  
  const roomId = params.roomId ? parseInt(params.roomId, 10) : null;

  useEffect(() => {
    if (isLoaded && !username) {
      setLocation("/welcome");
    }
  }, [isLoaded, username, setLocation]);

  if (!isLoaded || !username) return null;

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar
          activeRoomId={roomId}
          username={username}
          onLogout={logout}
        />
        <div className="flex flex-col flex-1 relative min-w-0">
          <div className="absolute top-4 left-4 z-50 md:hidden">
            <SidebarTrigger className="bg-background/80 backdrop-blur border shadow-sm" />
          </div>
          
          {roomId ? (
            <ChatArea roomId={roomId} username={username} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 relative">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md relative z-10 px-6"
              >
                <div className="w-20 h-20 mb-6 rounded-2xl bg-white shadow-xl shadow-black/5 border border-border/50 flex items-center justify-center mx-auto rotate-3 hover:rotate-0 transition-transform duration-300">
                  <MessageSquareText className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-3 tracking-tight">
                  Welcome, {username}!
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Select a room from the sidebar to start joining the conversation, or create a brand new one to gather your team.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
