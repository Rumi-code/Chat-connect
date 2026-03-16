import { Link, useLocation } from "wouter";
import { Bot, Hash, LogOut, Plus, MessageSquare } from "lucide-react";
import { useListConversations, useListOpenaiConversations, useCreateOpenaiConversation } from "@workspace/api-client-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AddContactDialog } from "./add-contact-dialog";
import { CreateConversationDialog } from "./create-conversation-dialog";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  
  const { data: convos = [] } = useListConversations({ userId: user?.id ?? 0 }, { query: { refetchInterval: 5000, enabled: !!user } });
  const { data: aiChats = [] } = useListOpenaiConversations({ query: { enabled: !!user } });
  const createAiChat = useCreateOpenaiConversation();

  const dms = convos.filter(c => c.type === "dm");
  const groups = convos.filter(c => c.type === "group");

  const handleNewAiChat = async () => {
    const res = await createAiChat.mutateAsync({ data: { title: "New AI Chat" } });
    setLocation(`/ai/${res.id}`);
  };

  const getOtherUser = (members: any[]) => members.find(m => m.id !== user?.id) || members[0];

  return (
    <div className="w-72 bg-sidebar flex flex-col h-full border-r border-white/5 relative z-10 shrink-0">
      {/* Header Profile */}
      <div className="h-20 px-6 flex items-center gap-4 border-b border-white/5">
        <Avatar className="h-11 w-11 shadow-lg border-2 border-white/10">
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: user?.avatarColor }}>
            {user?.displayName?.charAt(0).toUpperCase()}
          </div>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-base truncate">{user?.displayName}</h2>
          <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-8">
        
        {/* Actions Row */}
        <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl border border-white/5">
          <AddContactDialog />
          <div className="w-[1px] h-6 bg-white/10" />
          <CreateConversationDialog />
          <div className="w-[1px] h-6 bg-white/10" />
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-primary" onClick={handleNewAiChat}>
            <Bot className="h-4 w-4" />
          </Button>
        </div>

        {/* Direct Messages */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-2">Direct Messages</h3>
          <div className="space-y-1">
            {dms.length === 0 && <p className="text-xs text-white/30 px-2 italic">No messages yet</p>}
            {dms.map(c => {
              const isActive = location === `/c/${c.id}`;
              const other = getOtherUser(c.members);
              return (
                <Link key={c.id} href={`/c/${c.id}`} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border", isActive ? "bg-primary/20 border-primary/30 shadow-inner" : "hover:bg-white/5 border-transparent")}>
                  <Avatar className="h-9 w-9">
                    <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: other?.avatarColor }}>{other?.displayName.charAt(0).toUpperCase()}</div>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm truncate", isActive ? "font-semibold text-primary-foreground" : "font-medium")}>{other?.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage?.content || "Say hi!"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Groups */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-2">Groups</h3>
          <div className="space-y-1">
            {groups.length === 0 && <p className="text-xs text-white/30 px-2 italic">No groups yet</p>}
            {groups.map(c => {
              const isActive = location === `/c/${c.id}`;
              return (
                <Link key={c.id} href={`/c/${c.id}`} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border", isActive ? "bg-primary/20 border-primary/30 shadow-inner" : "hover:bg-white/5 border-transparent")}>
                  <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold", isActive ? "bg-primary text-white" : "bg-white/10 text-muted-foreground")}>
                    <Hash className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm truncate", isActive ? "font-semibold text-primary-foreground" : "font-medium")}>{c.name || "Unnamed Group"}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.members.length} members</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI Assistant */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-2">AI Agents</h3>
          <div className="space-y-1">
            {aiChats.map(c => {
              const isActive = location === `/ai/${c.id}`;
              return (
                <Link key={c.id} href={`/ai/${c.id}`} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border", isActive ? "bg-accent/20 border-accent/30 shadow-inner" : "hover:bg-white/5 border-transparent")}>
                  <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold", isActive ? "bg-accent text-white" : "bg-white/10 text-muted-foreground")}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm truncate", isActive ? "font-semibold text-accent-foreground" : "font-medium")}>{c.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      <div className="p-4 border-t border-white/5">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={logout}>
          <LogOut className="mr-3 h-5 w-5" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
