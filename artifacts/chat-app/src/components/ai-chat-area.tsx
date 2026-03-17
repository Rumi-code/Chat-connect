import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useGetOpenaiConversation } from "@workspace/api-client-react";
import { useVoiceStream, useVoiceRecorder } from "@workspace/integrations-openai-ai-react";
import { useAiStream } from "@/hooks/use-ai-stream";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VoiceState = "idle" | "call-active" | "recording" | "processing";

export function AiChatArea() {
  const { id } = useParams();
  const conversationId = parseInt(id || "0");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceTranscripts, setVoiceTranscripts] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  const { data: conv, refetch } = useGetOpenaiConversation(conversationId);
  const messages = conv?.messages || [];
  
  const { sendMessage, isStreaming, currentChunk } = useAiStream(conversationId);

  const basePath = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : import.meta.env.BASE_URL + "/";
  const workletPath = `${basePath}audio-playback-worklet.js`;

  const voiceStream = useVoiceStream({
    workletPath,
    onUserTranscript: (text) => {
      setVoiceTranscripts(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "user") return [...prev.slice(0, -1), { role: "user", text }];
        return [...prev, { role: "user", text }];
      });
    },
    onTranscript: (_chunk, full) => {
      setVoiceTranscripts(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return [...prev.slice(0, -1), { role: "assistant", text: full }];
        return [...prev, { role: "assistant", text: full }];
      });
    },
    onComplete: () => {
      setVoiceState("call-active");
      refetch();
    },
    onError: () => setVoiceState("call-active"),
  });

  const recorder = useVoiceRecorder();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentChunk, voiceTranscripts]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isStreaming) return;
    const text = content;
    setContent("");
    await sendMessage(text);
  };

  const startVoiceCall = () => {
    setVoiceState("call-active");
    setVoiceTranscripts([]);
  };

  const endVoiceCall = () => {
    if (recorder.state === "recording") recorder.stopRecording();
    setVoiceState("idle");
    setVoiceTranscripts([]);
  };

  const startRecording = useCallback(async () => {
    if (voiceState !== "call-active" || recorder.state === "recording") return;
    await recorder.startRecording();
  }, [voiceState, recorder]);

  const stopAndSend = useCallback(async () => {
    if (recorder.state !== "recording") return;
    setVoiceState("processing");
    const blob = await recorder.stopRecording();
    if (blob && blob.size > 0) {
      await voiceStream.streamVoiceResponse(
        `/api/openai/conversations/${conversationId}/voice-messages`,
        blob
      );
    }
    setVoiceState("call-active");
    refetch();
  }, [recorder, conversationId, voiceStream, refetch]);

  return (
    <div className="flex-1 flex flex-col h-full relative bg-gradient-to-br from-background via-background to-accent/5 backdrop-blur-3xl">
      {/* Header */}
      <div className="h-20 px-8 border-b border-accent/20 flex items-center justify-between shrink-0 bg-card/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20 border border-white/10">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl flex items-center gap-2">
              {conv?.title || "AI Assistant"} <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            </h3>
            <p className="text-sm text-accent/80">Powered by OpenAI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {voiceState === "idle" ? (
            <Button
              onClick={startVoiceCall}
              variant="secondary"
              size="icon"
              className="w-12 h-12 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent"
              title="Start AI voice call"
            >
              <Phone className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={endVoiceCall}
              variant="destructive"
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg shadow-destructive/20"
              title="End voice call"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Voice Call Panel */}
      <AnimatePresence>
        {voiceState !== "idle" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden shrink-0"
          >
            <div className="mx-6 mt-4 bg-accent/10 border border-accent/20 rounded-3xl p-5 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-accent font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Voice Call Active — Hold mic to speak
              </div>

              {voiceTranscripts.length > 0 && (
                <div className="w-full space-y-2 max-h-28 overflow-y-auto px-1">
                  {voiceTranscripts.map((t, i) => (
                    <div key={i} className={cn(
                      "px-3 py-1.5 rounded-2xl text-sm",
                      t.role === "user"
                        ? "bg-primary/20 text-primary ml-auto max-w-[80%] text-right"
                        : "bg-accent/20 text-accent max-w-[80%]"
                    )}>
                      {t.text}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopAndSend}
                  onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                  onTouchEnd={(e) => { e.preventDefault(); stopAndSend(); }}
                  disabled={voiceState === "processing"}
                  className={cn(
                    "w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all select-none",
                    voiceState === "processing"
                      ? "border-muted-foreground bg-muted/30 animate-pulse cursor-wait"
                      : recorder.state === "recording"
                        ? "border-destructive bg-destructive/20 text-destructive scale-110 shadow-lg shadow-destructive/20"
                        : "border-accent bg-accent/10 text-accent hover:bg-accent/20 hover:scale-105 cursor-pointer"
                  )}
                >
                  {voiceState === "processing"
                    ? <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    : recorder.state === "recording"
                      ? <MicOff className="w-7 h-7" />
                      : <Mic className="w-7 h-7" />
                  }
                </button>
                <span className="text-xs text-muted-foreground">
                  {voiceState === "processing" ? "AI is thinking..." : recorder.state === "recording" ? "Release to send" : "Hold to speak"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll p-8 flex flex-col gap-6">
        {messages.length === 0 && voiceState === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center text-accent/50">
            <Bot className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">How can I help you today?</p>
            <p className="text-sm mt-2 opacity-70">Type a message or tap the phone icon to call</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.role === "user";
            return (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                className={cn("flex gap-4 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}
              >
                {!isMe && (
                  <Avatar className="h-10 w-10 shrink-0 mt-auto shadow-sm border border-accent/30 bg-accent/20">
                    <div className="w-full h-full flex items-center justify-center"><Bot className="w-6 h-6 text-accent" /></div>
                  </Avatar>
                )}
                <div className={cn("p-4 rounded-3xl shadow-md", isMe ? "bg-primary text-white rounded-br-sm shadow-primary/20" : "bg-card/80 backdrop-blur-sm border border-white/10 rounded-bl-sm")}>
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                </div>
              </motion.div>
            )
          })}
          {isStreaming && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 max-w-[85%]">
              <Avatar className="h-10 w-10 shrink-0 mt-auto shadow-sm border border-accent/30 bg-accent/20">
                <div className="w-full h-full flex items-center justify-center"><Bot className="w-6 h-6 text-accent" /></div>
              </Avatar>
              <div className="p-4 rounded-3xl shadow-md bg-card/80 backdrop-blur-sm border border-accent/20 rounded-bl-sm min-w-[60px]">
                {currentChunk ? (
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{currentChunk}<span className="inline-block w-2 h-4 ml-1 bg-accent animate-pulse align-middle" /></p>
                ) : (
                  <div className="flex gap-1.5 pt-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-accent/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Text Input */}
      <div className="p-6 pt-0 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center bg-card/60 backdrop-blur-xl border border-accent/20 p-2 rounded-3xl shadow-xl shadow-accent/5">
          <Input 
            placeholder="Ask the AI assistant..." 
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={isStreaming}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none text-base px-6 placeholder:text-accent/40"
          />
          <Button type="submit" disabled={!content.trim() || isStreaming} size="icon" className="w-12 h-12 rounded-2xl bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/30 shrink-0 transition-transform active:scale-95 disabled:opacity-50">
            <Send className="w-5 h-5 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
