import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Send, Mic, MicOff, Phone, PhoneOff, Plus, Trash2, Settings, LogOut, KeyRound, Download, Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  getUser, saveUser, createUser,
  getConversations, createConversation, getConversation,
  addMessage, deleteConversation,
  getSettings, saveSetting,
  type LocalUser, type LocalConversation, type LocalMessage,
} from "./store";

// ── Themes ──────────────────────────────────────────────────────────────────
const THEMES = [
  { id: "dark",     name: "Dark",    preview: "#0f0f12", vars: { "--background":"240 10% 6%","--foreground":"0 0% 95%","--card":"240 10% 9%","--sidebar":"240 10% 5%","--primary":"265 89% 58%","--primary-foreground":"0 0% 100%","--accent":"265 89% 68%","--muted":"240 5% 18%","--muted-foreground":"240 5% 60%","--border":"240 5% 18%","--card-foreground":"0 0% 95%" }},
  { id: "midnight", name: "Midnight",preview: "#03071e", vars: { "--background":"222 47% 5%","--foreground":"210 40% 95%","--card":"222 47% 8%","--sidebar":"222 47% 4%","--primary":"213 94% 58%","--primary-foreground":"0 0% 100%","--accent":"213 94% 68%","--muted":"222 20% 16%","--muted-foreground":"215 20% 55%","--border":"222 20% 16%","--card-foreground":"210 40% 95%" }},
  { id: "ocean",    name: "Ocean",   preview: "#03045e", vars: { "--background":"197 60% 6%","--foreground":"197 30% 95%","--card":"197 60% 9%","--sidebar":"197 60% 5%","--primary":"185 96% 42%","--primary-foreground":"0 0% 100%","--accent":"185 96% 52%","--muted":"197 25% 18%","--muted-foreground":"197 20% 55%","--border":"197 25% 18%","--card-foreground":"197 30% 95%" }},
  { id: "forest",   name: "Forest",  preview: "#0a1f0a", vars: { "--background":"138 40% 5%","--foreground":"138 20% 93%","--card":"138 40% 8%","--sidebar":"138 40% 4%","--primary":"142 71% 45%","--primary-foreground":"0 0% 100%","--accent":"142 71% 55%","--muted":"138 20% 16%","--muted-foreground":"138 15% 55%","--border":"138 20% 16%","--card-foreground":"138 20% 93%" }},
  { id: "rose",     name: "Rose",    preview: "#1f0a14", vars: { "--background":"345 40% 5%","--foreground":"345 20% 95%","--card":"345 40% 8%","--sidebar":"345 40% 4%","--primary":"346 77% 55%","--primary-foreground":"0 0% 100%","--accent":"346 77% 65%","--muted":"345 20% 16%","--muted-foreground":"345 15% 55%","--border":"345 20% 16%","--card-foreground":"345 20% 95%" }},
  { id: "light",    name: "Light",   preview: "#f8f8f8", vars: { "--background":"0 0% 98%","--foreground":"240 10% 8%","--card":"0 0% 100%","--sidebar":"240 5% 94%","--primary":"265 89% 58%","--primary-foreground":"0 0% 100%","--accent":"265 89% 58%","--muted":"240 5% 90%","--muted-foreground":"240 5% 45%","--border":"240 5% 85%","--card-foreground":"240 10% 8%" }},
];

const CHAT_BACKGROUNDS = [
  { id: "default",         name: "Default",       style: {} },
  { id: "gradient-purple", name: "Purple Haze",   style: { background: "linear-gradient(135deg, #1a0533 0%, #0f0f1a 50%, #0a1a2e 100%)" } },
  { id: "gradient-ocean",  name: "Deep Ocean",    style: { background: "linear-gradient(135deg, #001e3c 0%, #0a1628 50%, #0f2a3f 100%)" } },
  { id: "gradient-forest", name: "Dark Forest",   style: { background: "linear-gradient(135deg, #0a1f0a 0%, #0f1a0f 50%, #162b16 100%)" } },
  { id: "gradient-rose",   name: "Midnight Rose", style: { background: "linear-gradient(135deg, #1f0a14 0%, #1a0f14 50%, #2b0a16 100%)" } },
  { id: "dots",            name: "Dot Grid",      style: { backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "20px 20px" } },
  { id: "grid",            name: "Grid Lines",    style: { backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" } },
];

function applyTheme(id: string) {
  const theme = THEMES.find(t => t.id === id) || THEMES[0];
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme.vars)) root.style.setProperty(k, v);
}

// ── Contexts ─────────────────────────────────────────────────────────────────
const AppCtx = createContext<{
  user: LocalUser;
  logout: () => void;
  themeId: string;
  setTheme: (id: string) => void;
  bgId: (convId: string) => string;
  setBg: (convId: string, bgId: string) => void;
  conversations: LocalConversation[];
  refreshConversations: () => void;
}>(null!);

// ── Welcome / Auth Screen ─────────────────────────────────────────────────────
function WelcomeScreen({ onLogin }: { onLogin: (u: LocalUser) => void }) {
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onLogin(createUser(name.trim(), apiKey.trim()));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl z-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">Nexus Chat</h1>
            <p className="text-sm text-muted-foreground">Standalone — no server required</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <Input
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-white/5 border-white/10 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-accent" />
              OpenAI API Key
              <span className="text-xs text-muted-foreground font-normal">(for AI chat)</span>
            </label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl pr-16"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your key stays in your browser — never sent anywhere except OpenAI. You can skip this and add it later in Settings.
            </p>
          </div>

          <Button type="submit" disabled={!name.trim()} className="w-full h-12 rounded-2xl text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
            Get Started →
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Settings Dialog ───────────────────────────────────────────────────────────
function SettingsDialog({ convId }: { convId?: string }) {
  const { user, themeId, setTheme, bgId, setBg } = useContext(AppCtx);
  const [apiKey, setApiKey] = useState(user.apiKey);
  const [saved, setSaved] = useState(false);

  const saveKey = () => {
    saveUser({ ...user, apiKey });
    user.apiKey = apiKey;
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const currentBg = convId ? bgId(convId) : "default";

  return (
    <Dialog>
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
            {convId && (
              <TabsTrigger value="bg" className="flex-1 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                Background
              </TabsTrigger>
            )}
            <TabsTrigger value="api" className="flex-1 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <KeyRound className="w-4 h-4 mr-2" /> API Key
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">Choose your color theme.</p>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                    themeId === t.id ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  )}>
                  <div className="w-10 h-10 rounded-xl border-2 border-white/20 flex items-center justify-center" style={{ backgroundColor: t.preview }}>
                    {themeId === t.id && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <span className="text-xs font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          {convId && (
            <TabsContent value="bg" className="mt-0 space-y-3">
              <p className="text-sm text-muted-foreground">Set a background for this chat.</p>
              <div className="grid grid-cols-2 gap-2">
                {CHAT_BACKGROUNDS.map(bg => (
                  <button key={bg.id} onClick={() => setBg(convId, bg.id)}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-sm font-medium",
                      currentBg === bg.id ? "border-primary bg-primary/10 text-primary" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                    )}>
                    <div className="w-6 h-6 rounded-lg border border-white/20 shrink-0" style={bg.style} />
                    <span className="text-xs">{bg.name}</span>
                    {currentBg === bg.id && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            </TabsContent>
          )}

          <TabsContent value="api" className="mt-0 space-y-4">
            <p className="text-sm text-muted-foreground">Your OpenAI API key — stored only in your browser.</p>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl"
              />
              <Button onClick={saveKey} className="w-full rounded-xl" variant={saved ? "secondary" : "default"}>
                {saved ? "✓ Saved" : "Save Key"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get a key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="underline text-accent">platform.openai.com</a>. Used for AI chat only.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ── AI Chat Area ──────────────────────────────────────────────────────────────
function AIChatArea({ convId }: { convId: string }) {
  const { user, bgId, refreshConversations } = useContext(AppCtx);
  const [conv, setConv] = useState<LocalConversation | null>(null);
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamChunk, setStreamChunk] = useState("");
  const [voiceState, setVoiceState] = useState<"idle" | "active" | "recording" | "processing">("idle");
  const [voiceLog, setVoiceLog] = useState<{role: "user"|"assistant"; text: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const reload = useCallback(() => {
    const c = getConversation(convId);
    setConv(c);
  }, [convId]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.messages, streamChunk, voiceLog]);

  const streamAI = async (messages: {role:string;content:string}[]) => {
    const key = user.apiKey;
    if (!key) throw new Error("No API key. Add one in Settings.");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", messages, stream: true }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buf = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") break;
        try {
          const c = JSON.parse(data)?.choices?.[0]?.delta?.content;
          if (c) { full += c; setStreamChunk(prev => prev + c); }
        } catch {}
      }
    }
    return full;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isStreaming || !conv) return;
    const text = content;
    setContent("");

    if (!user.apiKey) {
      alert("Please add your OpenAI API key in Settings first.");
      return;
    }

    addMessage(convId, { role: "user", content: text });
    reload();
    refreshConversations();

    setIsStreaming(true);
    setStreamChunk("");
    try {
      const history = getConversation(convId)!.messages.map(m => ({ role: m.role, content: m.content }));
      const systemMsg = { role: "system", content: "You are a helpful AI assistant in a chat app. Be friendly, concise, and helpful." };
      const full = await streamAI([systemMsg, ...history]);
      addMessage(convId, { role: "assistant", content: full });
    } catch (err: any) {
      addMessage(convId, { role: "assistant", content: `⚠️ ${err.message}` });
    } finally {
      setIsStreaming(false);
      setStreamChunk("");
      reload();
      refreshConversations();
    }
  };

  const startVoiceCall = () => { setVoiceState("active"); setVoiceLog([]); };
  const endVoiceCall = () => {
    if (mediaRef.current?.state === "recording") mediaRef.current.stop();
    setVoiceState("idle");
  };

  const startRecording = useCallback(async () => {
    if (voiceState !== "active") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        if (blob.size < 100) { setVoiceState("active"); return; }
        setVoiceState("processing");
        try {
          // STT with OpenAI Whisper
          const fd = new FormData();
          fd.append("file", blob, "audio.webm");
          fd.append("model", "whisper-1");
          const sttRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST", headers: { "Authorization": `Bearer ${user.apiKey}` }, body: fd
          });
          if (!sttRes.ok) throw new Error("STT failed");
          const { text: userText } = await sttRes.json();
          if (!userText?.trim()) { setVoiceState("active"); return; }

          setVoiceLog(p => [...p, { role: "user", text: userText }]);
          addMessage(convId, { role: "user", content: userText });
          reload();

          // AI response
          const history = getConversation(convId)!.messages.map(m => ({ role: m.role, content: m.content }));
          const systemMsg = { role: "system", content: "You are a helpful AI assistant. Keep responses concise for voice." };
          const aiText = await streamAI([systemMsg, ...history]);

          addMessage(convId, { role: "assistant", content: aiText });
          setVoiceLog(p => [...p, { role: "assistant", text: aiText }]);
          reload();
          refreshConversations();

          // TTS with OpenAI
          const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: { "Authorization": `Bearer ${user.apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "tts-1", voice: "alloy", input: aiText }),
          });
          if (ttsRes.ok) {
            const audioBlob = await ttsRes.blob();
            const url = URL.createObjectURL(audioBlob);
            const audio = new Audio(url);
            audio.onended = () => URL.revokeObjectURL(url);
            await audio.play();
          }
        } catch (err: any) {
          setVoiceLog(p => [...p, { role: "assistant", text: `⚠️ ${err.message}` }]);
        } finally {
          setVoiceState("active");
        }
      };
      mr.start();
      mediaRef.current = mr;
      setVoiceState("recording");
    } catch {
      alert("Microphone access denied.");
      setVoiceState("active");
    }
  }, [voiceState, user.apiKey, convId]);

  const stopRecording = useCallback(() => {
    if (mediaRef.current?.state === "recording") mediaRef.current.stop();
  }, []);

  const currentBgId = bgId(convId);
  const bgStyle = CHAT_BACKGROUNDS.find(b => b.id === currentBgId)?.style || {};

  if (!conv) return null;

  return (
    <div className="flex-1 flex flex-col h-full relative" style={bgStyle as React.CSSProperties}>
      {/* Header */}
      <div className="h-20 px-8 border-b border-accent/20 flex items-center justify-between shrink-0 bg-card/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-accent to-primary flex items-center justify-center shadow-lg border border-white/10">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl flex items-center gap-2">
              {conv.title} <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            </h3>
            <p className="text-sm text-accent/80">Powered by OpenAI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SettingsDialog convId={convId} />
          {voiceState === "idle" ? (
            <Button onClick={startVoiceCall} variant="secondary" size="icon"
              className="w-12 h-12 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent">
              <Phone className="w-5 h-5" />
            </Button>
          ) : (
            <Button onClick={endVoiceCall} variant="destructive" size="icon" className="w-12 h-12 rounded-full">
              <PhoneOff className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Voice Panel */}
      <AnimatePresence>
        {voiceState !== "idle" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden shrink-0">
            <div className="mx-6 mt-4 bg-accent/10 border border-accent/20 rounded-3xl p-5 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-accent font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Voice Call Active — Hold mic to speak
              </div>
              {voiceLog.length > 0 && (
                <div className="w-full space-y-2 max-h-28 overflow-y-auto px-1">
                  {voiceLog.map((t, i) => (
                    <div key={i} className={cn("px-3 py-1.5 rounded-2xl text-sm",
                      t.role === "user" ? "bg-primary/20 text-primary ml-auto max-w-[80%] text-right" : "bg-accent/20 text-accent max-w-[80%]"
                    )}>{t.text}</div>
                  ))}
                </div>
              )}
              <div className="flex flex-col items-center gap-2">
                <button
                  onMouseDown={startRecording} onMouseUp={stopRecording}
                  onTouchStart={e => { e.preventDefault(); startRecording(); }}
                  onTouchEnd={e => { e.preventDefault(); stopRecording(); }}
                  disabled={voiceState === "processing"}
                  className={cn("w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all select-none",
                    voiceState === "processing" ? "border-muted-foreground bg-muted/30 animate-pulse cursor-wait" :
                    voiceState === "recording" ? "border-destructive bg-destructive/20 text-destructive scale-110 shadow-lg shadow-destructive/20" :
                    "border-accent bg-accent/10 text-accent hover:bg-accent/20 hover:scale-105 cursor-pointer"
                  )}>
                  {voiceState === "processing"
                    ? <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    : voiceState === "recording" ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
                <span className="text-xs text-muted-foreground">
                  {voiceState === "processing" ? "AI is thinking..." : voiceState === "recording" ? "Release to send" : "Hold to speak"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6" style={{ scrollbarWidth: "thin" }}>
        {conv.messages.length === 0 && !isStreaming && (
          <div className="flex-1 flex flex-col items-center justify-center text-accent/50">
            <Bot className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">How can I help you today?</p>
            <p className="text-sm mt-1 opacity-70">Type or use the phone icon to call</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {conv.messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn("flex gap-4 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
              {msg.role === "assistant" && (
                <Avatar className="h-10 w-10 shrink-0 mt-auto border border-accent/30 bg-accent/20">
                  <div className="w-full h-full flex items-center justify-center"><Bot className="w-6 h-6 text-accent" /></div>
                </Avatar>
              )}
              <div className={cn("p-4 rounded-3xl shadow-md",
                msg.role === "user" ? "bg-primary text-white rounded-br-sm shadow-primary/20" : "bg-card/80 backdrop-blur-sm border border-white/10 rounded-bl-sm"
              )}>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isStreaming && streamChunk && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 max-w-[85%]">
              <Avatar className="h-10 w-10 shrink-0 mt-auto border border-accent/30 bg-accent/20">
                <div className="w-full h-full flex items-center justify-center"><Bot className="w-6 h-6 text-accent" /></div>
              </Avatar>
              <div className="p-4 rounded-3xl bg-card/80 backdrop-blur-sm border border-accent/20 rounded-bl-sm">
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{streamChunk}<span className="inline-block w-2 h-4 ml-1 bg-accent animate-pulse align-middle" /></p>
              </div>
            </motion.div>
          )}
          {isStreaming && !streamChunk && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <Avatar className="h-10 w-10 shrink-0 mt-auto border border-accent/30 bg-accent/20">
                <div className="w-full h-full flex items-center justify-center"><Bot className="w-6 h-6 text-accent" /></div>
              </Avatar>
              <div className="p-4 rounded-3xl bg-card/80 border border-accent/20 rounded-bl-sm min-w-[60px] flex gap-1.5 items-center">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 pt-0 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center bg-card/60 backdrop-blur-xl border border-accent/20 p-2 rounded-3xl shadow-xl">
          <Input placeholder="Ask the AI assistant…" value={content} onChange={e => setContent(e.target.value)}
            disabled={isStreaming}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none text-base px-6 placeholder:text-accent/40" />
          <Button type="submit" disabled={!content.trim() || isStreaming} size="icon"
            className="w-12 h-12 rounded-2xl bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/30 shrink-0 active:scale-95 disabled:opacity-50">
            <Send className="w-5 h-5 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background/50 text-muted-foreground gap-4">
      <div className="w-20 h-20 bg-card border border-white/5 rounded-3xl flex items-center justify-center rotate-12">
        <Sparkles className="absolute -top-3 -right-3 w-7 h-7 text-accent animate-pulse" style={{ position: "absolute" }} />
        <Bot className="w-10 h-10 text-primary" />
      </div>
      <p className="text-lg font-medium">Select or create an AI chat</p>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function StandaloneApp() {
  const [user, setUser] = useState<LocalUser | null>(() => getUser());
  const [themeId, setThemeIdState] = useState<string>(() => getSettings().themeId || "dark");
  const [chatBgs, setChatBgs] = useState<Record<string, string>>(() => getSettings().chatBgs || {});
  const [conversations, setConversations] = useState<LocalConversation[]>(() => getConversations());
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  useEffect(() => { applyTheme(themeId); }, [themeId]);

  const setTheme = (id: string) => {
    setThemeIdState(id);
    saveSetting("themeId", id);
    applyTheme(id);
  };

  const getBg = (convId: string) => chatBgs[convId] || "default";
  const setBg = (convId: string, bgId: string) => {
    setChatBgs(prev => { const n = { ...prev, [convId]: bgId }; saveSetting("chatBgs", n); return n; });
  };

  const refreshConversations = () => setConversations(getConversations());

  const handleNewChat = () => {
    const c = createConversation();
    refreshConversations();
    setActiveConvId(c.id);
  };

  const handleDelete = (id: string) => {
    deleteConversation(id);
    refreshConversations();
    if (activeConvId === id) setActiveConvId(null);
  };

  const logout = () => { localStorage.removeItem("nexus-standalone:user"); setUser(null); };

  if (!user) return <WelcomeScreen onLogin={u => setUser(u)} />;

  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <AppCtx.Provider value={{ user, logout, themeId, setTheme, bgId: getBg, setBg, conversations, refreshConversations }}>
      <div className="flex h-[100dvh] w-full bg-sidebar overflow-hidden text-foreground">
        {/* Sidebar */}
        <div className="w-72 bg-sidebar flex flex-col h-full border-r border-white/5 shrink-0">
          {/* Profile */}
          <div className="h-20 px-6 flex items-center gap-4 border-b border-white/5">
            <Avatar className="h-11 w-11 border-2 border-white/10 shadow-lg">
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: user.avatarColor }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-base truncate">{user.name}</h2>
              <p className="text-xs text-muted-foreground">{user.apiKey ? "API key set ✓" : "No API key"}</p>
            </div>
            <SettingsDialog convId={activeConvId || undefined} />
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">AI Chats</h3>
              <button onClick={handleNewChat} className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {conversations.length === 0 && (
                <p className="text-xs text-white/30 italic px-2">No chats yet — click + to start</p>
              )}
              {conversations.map(c => (
                <div key={c.id}
                  className={cn("group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border cursor-pointer",
                    activeConvId === c.id ? "bg-accent/20 border-accent/30" : "hover:bg-white/5 border-transparent"
                  )}
                  onClick={() => setActiveConvId(c.id)}>
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    activeConvId === c.id ? "bg-accent text-white" : "bg-white/10 text-muted-foreground"
                  )}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <p className="text-sm flex-1 truncate font-medium">{c.title}</p>
                  <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-destructive/20 hover:text-destructive text-muted-foreground flex items-center justify-center transition-all shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 space-y-1">
            <a href="nexus-chat-standalone.html" download="nexus-chat-standalone.html">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10">
                <Download className="mr-3 h-5 w-5" /> Download this app
              </Button>
            </a>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={logout}>
              <LogOut className="mr-3 h-5 w-5" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 flex flex-col relative min-w-0 bg-background md:rounded-l-[2rem] overflow-hidden border-l border-white/10 shadow-2xl z-20">
          {activeConv ? <AIChatArea key={activeConvId!} convId={activeConvId!} /> : <EmptyState />}
        </main>
      </div>
    </AppCtx.Provider>
  );
}
