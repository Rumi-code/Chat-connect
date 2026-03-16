import { useState } from "react";
import { useLocation } from "wouter";
import { MessageSquarePlus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useGetContacts, useCreateConversation } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function CreateConversationDialog() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [groupName, setGroupName] = useState("");
  
  const queryClient = useQueryClient();
  const { data: contacts = [] } = useGetContacts(user?.id ?? 0);
  const createConvMutation = useCreateConversation();

  const isGroup = selectedIds.length > 1;

  const handleCreate = async () => {
    if (selectedIds.length === 0 || !user) return;
    
    const type = isGroup ? "group" : "dm";
    const members = [user.id, ...selectedIds];
    
    const res = await createConvMutation.mutateAsync({
      data: { type, name: isGroup ? groupName : undefined, memberIds: members }
    });
    
    queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    setOpen(false);
    setSelectedIds([]);
    setGroupName("");
    setLocation(`/c/${res.id}`);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">New Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {isGroup && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Group Name</label>
              <Input 
                placeholder="e.g. Project Alpha..." 
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="bg-black/20 border-white/10 h-12 rounded-xl focus-visible:ring-primary"
              />
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-3">Select Contacts</label>
            <div className="space-y-1 min-h-[200px] max-h-[300px] overflow-y-auto chat-scroll pr-2">
              {contacts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No contacts yet. Search to add some!</p>
              )}
              {contacts.map(({ contact }) => (
                <div 
                  key={contact.id} 
                  onClick={() => toggleSelect(contact.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                    selectedIds.includes(contact.id) 
                      ? "bg-primary/20 border-primary/50" 
                      : "hover:bg-white/5 border-transparent"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: contact.avatarColor }}>
                      {contact.displayName.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{contact.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{contact.username}</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    selectedIds.includes(contact.id) ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {selectedIds.includes(contact.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button 
            className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 font-semibold" 
            disabled={selectedIds.length === 0 || (isGroup && !groupName.trim()) || createConvMutation.isPending}
            onClick={handleCreate}
          >
            {isGroup ? <><Users className="mr-2 h-5 w-5"/> Create Group</> : "Start Chat"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
