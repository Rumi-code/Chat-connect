import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSearchUsers, useAddContact } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export function AddContactDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();
  
  const { data: results = [], isLoading } = useSearchUsers({ q }, { query: { enabled: q.length >= 2 } });
  const addContactMutation = useAddContact();

  const handleAdd = async (contactId: number) => {
    if (!user) return;
    await addContactMutation.mutateAsync({ userId: user.id, data: { contactId } });
    queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/contacts`] });
    setOpen(false);
    setQ("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add a Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by username..." 
              value={q}
              onChange={e => setQ(e.target.value)}
              className="pl-9 bg-black/20 border-white/10 focus-visible:ring-primary h-12 rounded-xl"
            />
          </div>
          
          <div className="space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto chat-scroll pr-2">
            {isLoading && q.length >= 2 && <p className="text-sm text-center text-muted-foreground pt-4">Searching...</p>}
            {!isLoading && q.length >= 2 && results.length === 0 && (
              <p className="text-sm text-center text-muted-foreground pt-4">No users found.</p>
            )}
            {results.filter(r => r.id !== user?.id).map((resultUser) => (
              <div key={resultUser.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white/5">
                    <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: resultUser.avatarColor }}>
                      {resultUser.displayName.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                  <div>
                    <p className="font-medium">{resultUser.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{resultUser.username}</p>
                  </div>
                </div>
                <Button size="sm" className="rounded-full shadow-lg shadow-primary/20" onClick={() => handleAdd(resultUser.id)} disabled={addContactMutation.isPending}>
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
