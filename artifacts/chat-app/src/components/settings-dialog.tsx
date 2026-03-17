import { useState } from "react";
import { Settings, Palette, Image as ImageIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings, THEMES, CHAT_BACKGROUNDS } from "@/hooks/use-settings";
import { useListConversations } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const { themeId, setTheme, getChatBackground, setChatBackground } = useSettings();
  const { user } = useAuth();
  const { data: convos = [] } = useListConversations({ userId: user?.id ?? 0 });
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(null);

  const getOtherUser = (members: any[]) => members.find((m: any) => m.id !== user?.id) || members[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-muted-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card border border-white/10 shadow-2xl rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Settings
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="theme" className="p-6 pt-4">
          <TabsList className="w-full bg-white/5 border border-white/10 rounded-2xl p-1 mb-6">
            <TabsTrigger value="theme" className="flex-1 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Palette className="w-4 h-4 mr-2" /> Theme
            </TabsTrigger>
            <TabsTrigger value="backgrounds" className="flex-1 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <ImageIcon className="w-4 h-4 mr-2" /> Backgrounds
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-4 mt-0">
            <p className="text-sm text-muted-foreground">Choose your preferred color theme for the entire app.</p>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={cn(
                    "relative group flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                    themeId === theme.id
                      ? "border-primary bg-primary/10"
                      : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl border-2 border-white/20 flex items-center justify-center", theme.preview)}>
                    {themeId === theme.id && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <span className="text-xs font-medium">{theme.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="backgrounds" className="space-y-4 mt-0">
            <p className="text-sm text-muted-foreground">Customize the background for each chat conversation.</p>

            {convos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No conversations yet.</div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Select a chat</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {convos.map(c => {
                      const other = getOtherUser(c.members);
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedConvoId(c.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all",
                            selectedConvoId === c.id ? "bg-primary/20 text-primary" : "hover:bg-white/5"
                          )}
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: other?.avatarColor }}>
                            {(c.type === "dm" ? other?.displayName : c.name || "G")?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">
                            {c.type === "dm" ? other?.displayName : c.name || "Unnamed Group"}
                          </span>
                          {selectedConvoId === c.id && <Check className="w-4 h-4 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedConvoId && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Choose background</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CHAT_BACKGROUNDS.map(bg => {
                        const current = getChatBackground(selectedConvoId);
                        const isActive = current === bg.id;
                        return (
                          <button
                            key={bg.id}
                            onClick={() => setChatBackground(selectedConvoId, bg.id)}
                            className={cn(
                              "relative flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-sm font-medium",
                              isActive ? "border-primary bg-primary/10 text-primary" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                            )}
                          >
                            <div className="w-6 h-6 rounded-lg border border-white/20 shrink-0" style={{
                              background: bg.id === "dots" ? "radial-gradient(circle, #555 1px, transparent 1px) 0 0 / 8px 8px" :
                                bg.id === "grid" ? "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px) 0 0 / 16px 16px" :
                                bg.value || "#1a1a2e"
                            }} />
                            <span className="text-xs">{bg.name}</span>
                            {isActive && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
