import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Hash, LogOut, Plus, Download, X } from "lucide-react";
import { useListConversations, useListOpenaiConversations, useCreateOpenaiConversation } from "@workspace/api-client-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AddContactDialog } from "./add-contact-dialog";
import { CreateConversationDialog } from "./create-conversation-dialog";
import { SettingsDialog } from "./settings-dialog";
import { NexusLogo } from "./nexus-logo";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  
  const { data: convos = [] } = useListConversations({ userId: user?.id ?? 0 }, { query: { refetchInterval: 5000, enabled: !!user, queryKey: [] } as any });
  const { data: aiChats = [] } = useListOpenaiConversations({ query: { enabled: !!user, queryKey: [] } as any });
  const createAiChat = useCreateOpenaiConversation();

  const dms = convos.filter(c => c.type === "dm");
  const groups = convos.filter(c => c.type === "group");

  const handleNewAiChat = async () => {
    const res = await createAiChat.mutateAsync({ data: { title: "New AI Chat" } });
    setLocation(`/ai/${res.id}`);
    onClose?.();
  };

  const handleNavClick = () => {
    onClose?.();
  };

  const getOtherUser = (members: any[]) => members.find(m => m.id !== user?.id) || members[0];

  const sidebarContent = (
    <div className="w-72 bg-sidebar flex flex-col h-full border-r border-white/5 relative z-10 shrink-0">
      <div className="h-20 px-5 flex items-center justify-between border-b border-white/5">
        <NexusLogo size={34} />
        <div className="flex items-center gap-1">
          <SettingsDialog />
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 md:hidden" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/5">
          <Avatar className="h-9 w-9 shadow-md border border-white/10">
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: user?.avatarColor }}>
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-6">
        
        <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl border border-white/5">
          <AddContactDialog />
          <div className="w-[1px] h-6 bg-white/10" />
          <CreateConversationDialog />
          <div className="w-[1px] h-6 bg-white/10" />
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-primary" onClick={handleNewAiChat}>
            <Bot className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-2">Direct Messages</h3>
          <div className="space-y-1">
            {dms.length === 0 && <p className="text-xs text-white/30 px-2 italic">No messages yet</p>}
            <AnimatePresence>
              {dms.map((c, i) => {
                const isActive = location === `/c/${c.id}`;
                const other = getOtherUser(c.members);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <Link
                      href={`/c/${c.id}`}
                      onClick={handleNavClick}
                      className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border", isActive ? "bg-primary/20 border-primary/30 shadow-inner" : "hover:bg-white/5 border-transparent")}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: other?.avatarColor }}>{other?.displayName.charAt(0).toUpperCase()}</div>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", isActive ? "font-semibold text-primary-foreground" : "font-medium")}>{other?.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.lastMessage?.content || "Say hi!"}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-2">Groups</h3>
          <div className="space-y-1">
            {groups.length === 0 && <p className="text-xs text-white/30 px-2 italic">No groups yet</p>}
            <AnimatePresence>
              {groups.map((c, i) => {
                const isActive = location === `/c/${c.id}`;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <Link
                      href={`/c/${c.id}`}
                      onClick={handleNavClick}
                      className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border", isActive ? "bg-primary/20 border-primary/30 shadow-inner" : "hover:bg-white/5 border-transparent")}
                    >
                      <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0", isActive ? "bg-primary text-white" : "bg-white/10 text-muted-foreground")}>
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", isActive ? "font-semibold text-primary-foreground" : "font-medium")}>{c.name || "Unnamed Group"}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.members.length} members</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-2">AI Agents</h3>
          <div className="space-y-1">
            {aiChats.length === 0 && <p className="text-xs text-white/30 px-2 italic">No AI chats yet</p>}
            <AnimatePresence>
              {aiChats.map((c, i) => {
                const isActive = location === `/ai/${c.id}`;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <Link
                      href={`/ai/${c.id}`}
                      onClick={handleNavClick}
                      className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border", isActive ? "bg-accent/20 border-accent/30 shadow-inner" : "hover:bg-white/5 border-transparent")}
                    >
                      <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0", isActive ? "bg-accent text-white" : "bg-white/10 text-muted-foreground")}>
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", isActive ? "font-semibold text-accent-foreground" : "font-medium")}>{c.title}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>

      <div className="p-4 border-t border-white/5 space-y-1">
        <a href={`${import.meta.env.BASE_URL}nexus-chat-standalone.html`} download="nexus-chat-standalone.html">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10 min-h-[44px]">
            <Download className="mr-3 h-5 w-5" /> Download Standalone
          </Button>
        </a>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 min-h-[44px]" onClick={logout}>
          <LogOut className="mr-3 h-5 w-5" /> Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:flex">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed left-0 top-0 bottom-0 z-40 md:hidden flex"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
