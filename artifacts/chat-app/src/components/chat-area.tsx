import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Video, FileText, Check } from "lucide-react";
import { format } from "date-fns";
import { useListMessages, useSendChatMessage, useListConversations, useRequestUploadUrl } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebRTC } from "@/hooks/use-webrtc";
import { useSettings, CHAT_BACKGROUNDS } from "@/hooks/use-settings";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, getFileUrl } from "@/lib/utils";

function getBackgroundStyle(backgroundId: string): React.CSSProperties {
  const bg = CHAT_BACKGROUNDS.find(b => b.id === backgroundId);
  if (!bg || !bg.value) return {};
  if (bg.id === "dots") {
    return {
      backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    };
  }
  if (bg.id === "grid") {
    return {
      backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
    };
  }
  return { background: bg.value };
}

type PendingMessage = {
  tempId: string;
  content: string;
  type: "text";
  senderId: number;
  sender: { displayName: string; avatarColor: string; username: string };
  createdAt: string;
  pending: true;
};

export function ChatArea() {
  const { id } = useParams();
  const conversationId = parseInt(id || "0");
  const { user } = useAuth();
  const { startCall } = useWebRTC();
  const { getChatBackground, fontSize, bubbleStyle, enterToSend, timestampMode, compactMode } = useSettings();
  const queryClient = useQueryClient();

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);

  const { data: convos } = useListConversations({ userId: user?.id ?? 0 });
  const conversation = convos?.find(c => c.id === conversationId);
  const { data: serverMessages = [] } = useListMessages(conversationId, undefined, {
    query: { refetchInterval: 2000, enabled: !!conversationId, queryKey: [] } as any,
  });

  const sendMessageMutation = useSendChatMessage();
  const requestUploadUrl = useRequestUploadUrl();

  const allMessages = useMemo(() => {
    const serverSet = new Set(serverMessages.map(m => `${m.senderId}:${m.content}`));
    const filteredPending = pendingMessages.filter(
      pm => !serverSet.has(`${pm.senderId}:${pm.content}`)
    );
    return [...serverMessages, ...filteredPending] as Array<
      (typeof serverMessages)[number] | PendingMessage
    >;
  }, [serverMessages, pendingMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const doSend = useCallback(async (text: string) => {
    if (!text.trim() || !user) return;
    setContent("");

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimistic: PendingMessage = {
      tempId,
      content: text,
      type: "text",
      senderId: user.id,
      sender: { displayName: user.displayName, avatarColor: user.avatarColor, username: user.username },
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setPendingMessages(prev => [...prev, optimistic]);

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        data: { senderId: user.id, content: text, type: "text" },
      });
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
    } finally {
      setPendingMessages(prev => prev.filter(m => m.tempId !== tempId));
    }
  }, [user, conversationId, sendMessageMutation, queryClient]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await doSend(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && enterToSend) {
      e.preventDefault();
      doSend(content);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({
        data: { name: file.name, size: file.size, contentType: file.type },
      });
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      let type: "file" | "image" | "video" = "file";
      if (file.type.startsWith("image/")) type = "image";
      if (file.type.startsWith("video/")) type = "video";

      await sendMessageMutation.mutateAsync({
        conversationId,
        data: { senderId: user.id, content: file.name, type, fileUrl: objectPath, fileName: file.name, fileType: file.type },
      });
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const otherUser = conversation?.members.find(m => m.id !== user?.id);
  const bgId = getChatBackground(conversationId);
  const bgStyle = getBackgroundStyle(bgId);

  const fontSizeClass = fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg" : "text-[15px]";
  const gapClass = compactMode ? "gap-2 md:gap-3" : "gap-4 md:gap-6";

  const getBubbleRadius = (isMe: boolean, isTail: boolean) => {
    if (bubbleStyle === "square") return "rounded-lg";
    if (bubbleStyle === "pill") return cn("rounded-full px-5", isTail && (isMe ? "rounded-br-lg" : "rounded-bl-lg"));
    return cn("rounded-3xl", isTail && (isMe ? "rounded-br-sm" : "rounded-bl-sm"));
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-background/50 backdrop-blur-3xl" style={bgStyle}>
      {/* Header */}
      <div className="h-16 md:h-20 px-4 md:px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-card/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 md:gap-4">
          {conversation?.type === "dm" ? (
            <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white/10 shadow-lg">
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: otherUser?.avatarColor }}>
                {otherUser?.displayName.charAt(0).toUpperCase()}
              </div>
            </Avatar>
          ) : (
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg border border-white/10">
              <span className="text-lg font-bold">#</span>
            </div>
          )}
          <div>
            <h3 className="font-display font-bold text-lg md:text-xl leading-tight">
              {conversation?.type === "dm" ? otherUser?.displayName : conversation?.name}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {conversation?.type === "dm" ? `@${otherUser?.username}` : `${conversation?.members.length} members`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {conversation?.type === "dm" && (
            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-colors border border-white/10 shadow-lg"
              onClick={() => otherUser && startCall(conversationId, otherUser.id)}
            >
              <Video className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={cn("flex-1 overflow-y-auto chat-scroll p-4 md:p-8 flex flex-col", gapClass)}>
        {allMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground opacity-50">
            <p className="text-sm">This is the beginning of the conversation.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {allMessages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            const isPending = "pending" in msg && msg.pending;
            const prevMsg = allMessages[idx - 1];
            const showAvatar = idx === 0 || prevMsg?.senderId !== msg.senderId;
            const isTail = showAvatar;

            const displayTime = "createdAt" in msg ? format(new Date(msg.createdAt), "h:mm a") : "";
            const showTimestamp = timestampMode === "always" || (timestampMode === "hover");

            return (
              <motion.div
                key={"tempId" in msg ? msg.tempId : msg.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: isPending ? 0.75 : 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={cn("flex gap-3 max-w-[80%] md:max-w-[75%] group", isMe ? "ml-auto flex-row-reverse" : "")}
              >
                {showAvatar ? (
                  <Avatar className="h-9 w-9 shrink-0 mt-auto border border-white/10 shadow-sm">
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: msg.sender.avatarColor }}
                    >
                      {msg.sender.displayName.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                ) : (
                  <div className="w-9 shrink-0" />
                )}

                <div className={cn("flex flex-col min-w-0", isMe ? "items-end" : "items-start")}>
                  {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className="text-sm font-medium">{msg.sender.displayName}</span>
                      {showTimestamp && (
                        <span className={cn("text-xs text-muted-foreground", timestampMode === "hover" && "opacity-0 group-hover:opacity-100 transition-opacity")}>
                          {displayTime}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={cn(
                    "p-3 md:p-4 shadow-md relative",
                    getBubbleRadius(isMe, isTail),
                    isMe ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-card border border-white/5"
                  )}>
                    {"fileUrl" in msg && msg.type === "image" && msg.fileUrl && (
                      <img src={getFileUrl(msg.fileUrl)} alt="attachment" className="max-w-xs rounded-xl mb-3 object-cover max-h-64 shadow-inner border border-white/10" />
                    )}
                    {"fileUrl" in msg && msg.type === "video" && msg.fileUrl && (
                      <video src={getFileUrl(msg.fileUrl)} controls className="max-w-xs rounded-xl mb-3 max-h-64 shadow-inner border border-white/10" />
                    )}
                    {"fileUrl" in msg && msg.type === "file" && msg.fileUrl && (
                      <a href={getFileUrl(msg.fileUrl)} download className="flex items-center gap-3 p-3 bg-black/30 rounded-xl mb-3 hover:bg-black/40 transition-colors">
                        <FileText className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium underline underline-offset-2">{msg.content}</span>
                      </a>
                    )}
                    {msg.content && msg.type === "text" && (
                      <p className={cn("whitespace-pre-wrap leading-relaxed", fontSizeClass)}>{msg.content}</p>
                    )}

                    {isPending && (
                      <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-muted border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                      </span>
                    )}
                    {isMe && !isPending && (
                      <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-primary border border-white/10">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 pt-3 shrink-0 chat-input-safe">
        {!enterToSend && (
          <p className="text-xs text-muted-foreground text-center mb-2">Shift+Enter to send · Enter for new line</p>
        )}
        <form onSubmit={handleSend} className="relative flex items-center bg-card/60 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-xl">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-2xl hover:bg-white/5 shrink-0 text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading
              ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              : <Paperclip className="w-5 h-5" />
            }
          </Button>
          <Input
            ref={inputRef}
            placeholder={enterToSend ? "Type a message..." : "Type a message... (Shift+Enter to send)"}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none text-base px-3 placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            disabled={!content.trim()}
            size="icon"
            className="w-11 h-11 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 shrink-0 transition-all active:scale-95 disabled:opacity-40 disabled:scale-100"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
