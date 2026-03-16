import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles } from "lucide-react";
import { useGetOpenaiConversation } from "@workspace/api-client-react";
import { useAiStream } from "@/hooks/use-ai-stream";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AiChatArea() {
  const { id } = useParams();
  const conversationId = parseInt(id || "0");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");

  const { data: conv } = useGetOpenaiConversation(conversationId);
  const messages = conv?.messages || [];
  
  const { sendMessage, isStreaming, currentChunk } = useAiStream(conversationId);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentChunk]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isStreaming) return;
    const text = content;
    setContent("");
    await sendMessage(text);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-gradient-to-br from-background via-background to-accent/5 backdrop-blur-3xl">
      {/* Header */}
      <div className="h-20 px-8 border-b border-accent/20 flex items-center gap-4 shrink-0 bg-card/20 backdrop-blur-md z-10">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll p-8 flex flex-col gap-6">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-accent/50">
            <Bot className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">How can I help you today?</p>
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

      {/* Input */}
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
