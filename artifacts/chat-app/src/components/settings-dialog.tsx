import { useState } from "react";
import { Settings, Palette, Image as ImageIcon, Check, MessageSquare, Type, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings, THEMES, CHAT_BACKGROUNDS, type FontSize, type BubbleStyle, type TimestampMode } from "@/hooks/use-settings";
import { useListConversations } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-white/15"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function OptionGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-white/10 shrink-0">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium transition-colors",
            i > 0 && "border-l border-white/10",
            value === opt.value
              ? "bg-primary text-white"
              : "hover:bg-white/5 text-muted-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const {
    themeId, setTheme,
    getChatBackground, setChatBackground,
    fontSize, setFontSize,
    bubbleStyle, setBubbleStyle,
    enterToSend, setEnterToSend,
    timestampMode, setTimestampMode,
    soundEnabled, setSoundEnabled,
    compactMode, setCompactMode,
  } = useSettings();
  const { user } = useAuth();
  const { data: convos = [] } = useListConversations({ userId: user?.id ?? 0 });
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(null);

  const getOtherUser = (members: any[]) => members.find((m: any) => m.id !== user?.id) || members[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-muted-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card border border-white/10 shadow-2xl rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-0 shrink-0">
          <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="mx-6 mt-4 grid grid-cols-4 bg-white/5 border border-white/10 rounded-2xl p-1 shrink-0">
            <TabsTrigger value="appearance" className="rounded-xl text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-2">
              <Palette className="w-3.5 h-3.5 mr-1" /> Look
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-xl text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-2">
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Chat
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-2">
              <Bell className="w-3.5 h-3.5 mr-1" /> Alerts
            </TabsTrigger>
            <TabsTrigger value="backgrounds" className="rounded-xl text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-2">
              <ImageIcon className="w-3.5 h-3.5 mr-1" /> Walls
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">

            {/* APPEARANCE TAB */}
            <TabsContent value="appearance" className="p-6 space-y-6 mt-0">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Color Theme</p>
                <div className="grid grid-cols-3 gap-2">
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
                      <div className={cn("w-8 h-8 rounded-xl border-2 border-white/20 flex items-center justify-center", theme.preview)}>
                        {themeId === theme.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-xs font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Font Size</p>
                <div className="flex gap-2">
                  {([
                    { value: "sm", label: "Small", cls: "text-xs" },
                    { value: "md", label: "Medium", cls: "text-sm" },
                    { value: "lg", label: "Large", cls: "text-base" },
                  ] as { value: FontSize; label: string; cls: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFontSize(opt.value)}
                      className={cn(
                        "flex-1 py-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                        fontSize === opt.value ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <span className={cn("font-medium", opt.cls)}>Aa</span>
                      <span className="text-xs text-muted-foreground">{opt.label}</span>
                      {fontSize === opt.value && <Check className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <SettingRow label="Compact Mode" description="Reduce spacing between messages">
                  <Toggle checked={compactMode} onChange={setCompactMode} />
                </SettingRow>
              </div>
            </TabsContent>

            {/* MESSAGES TAB */}
            <TabsContent value="messages" className="p-6 space-y-1 mt-0">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Bubble Style</p>
                <div className="flex gap-2 mb-6">
                  {([
                    { value: "rounded", label: "Rounded", preview: "rounded-2xl" },
                    { value: "square", label: "Square", preview: "rounded-lg" },
                    { value: "pill", label: "Pill", preview: "rounded-full" },
                  ] as { value: BubbleStyle; label: string; preview: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setBubbleStyle(opt.value)}
                      className={cn(
                        "flex-1 py-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                        bubbleStyle === opt.value ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <div className={cn("w-12 h-5 bg-primary/40", opt.preview)} />
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <SettingRow label="Press Enter to Send" description="Shift+Enter adds a new line when enabled">
                <Toggle checked={enterToSend} onChange={setEnterToSend} />
              </SettingRow>

              <SettingRow label="Timestamps">
                <OptionGroup
                  value={timestampMode}
                  options={[
                    { value: "always", label: "Always" },
                    { value: "hover", label: "Hover" },
                    { value: "never", label: "Never" },
                  ]}
                  onChange={v => setTimestampMode(v as TimestampMode)}
                />
              </SettingRow>
            </TabsContent>

            {/* NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="p-6 space-y-1 mt-0">
              <SettingRow label="Sound Notifications" description="Play a sound when you receive a message">
                <Toggle checked={soundEnabled} onChange={setSoundEnabled} />
              </SettingRow>
              <SettingRow label="Desktop Notifications" description="Get notified even when the app is in the background">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-xl text-xs h-8"
                  onClick={() => Notification?.requestPermission?.()}
                >
                  Allow
                </Button>
              </SettingRow>
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-sm font-medium mb-1">Quiet Hours</p>
                <p className="text-xs text-muted-foreground">Coming soon — silence notifications during set hours.</p>
              </div>
            </TabsContent>

            {/* BACKGROUNDS TAB */}
            <TabsContent value="backgrounds" className="p-6 space-y-4 mt-0">
              <p className="text-sm text-muted-foreground">Customize the background for each chat.</p>

              {convos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No conversations yet.</div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Select a chat</p>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
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
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: other?.avatarColor }}>
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
                                background: bg.id === "dots"
                                  ? "radial-gradient(circle, #555 1px, transparent 1px) 0 0 / 8px 8px"
                                  : bg.id === "grid"
                                  ? "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px) 0 0 / 16px 16px"
                                  : bg.value || "#1a1a2e"
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

          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
