import { Link } from "wouter";
import { Hash, LogOut, MessageSquareText, Search } from "lucide-react";
import { useListRooms } from "@workspace/api-client-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreateRoomDialog } from "./create-room-dialog";

interface AppSidebarProps {
  username: string;
  activeRoomId: number | null;
  onLogout: () => void;
}

export function AppSidebar({ username, activeRoomId, onLogout }: AppSidebarProps) {
  // Poll rooms every 10s to see if new ones were created by others
  const { data: rooms = [], isLoading } = useListRooms({
    query: { refetchInterval: 10000 },
  });

  return (
    <Sidebar className="border-r-0 dark">
      <SidebarHeader className="p-4 pt-6 pb-2">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-sidebar-foreground">ChatApp</h1>
            <p className="text-xs text-sidebar-foreground/60 font-medium">Real-time messaging</p>
          </div>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/40" />
          <Input 
            placeholder="Search rooms..." 
            className="pl-9 bg-sidebar-accent/50 border-transparent focus-visible:ring-1 focus-visible:ring-sidebar-ring text-sidebar-foreground placeholder:text-sidebar-foreground/40 rounded-xl"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-2">
            <SidebarGroupLabel className="px-0 py-0 h-auto text-xs uppercase tracking-wider font-semibold text-sidebar-foreground/50">
              Channels
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            {isLoading && rooms.length === 0 ? (
              <div className="px-4 py-8 text-center text-sidebar-foreground/40 text-sm">
                Loading rooms...
              </div>
            ) : (
              <SidebarMenu>
                {rooms.map((room) => {
                  const isActive = room.id === activeRoomId;
                  return (
                    <SidebarMenuItem key={room.id}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className={`rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/10' 
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        <Link href={`/rooms/${room.id}`}>
                          <Hash className={`h-4 w-4 mr-2 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
                          <span className="truncate">{room.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="px-4 mt-2">
          <CreateRoomDialog />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 border-2 border-sidebar-border bg-sidebar-accent text-sidebar-foreground">
              <AvatarFallback className="bg-transparent font-semibold">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="truncate">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{username}</p>
              <p className="text-xs text-green-400 font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onLogout}
            className="text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 shrink-0"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
