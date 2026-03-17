import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Video, FileText, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { useListMessages, useSendChatMessage, useListConversations, useRequestUploadUrl } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebRTC } from "@/hooks/use-webrtc";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, getFileUrl } from "@/lib/utils";

export function ChatArea() {
  const { id } = useParams();
  const conversationId = parseInt(id || "0");
  const { user } = useAuth();
  const { startCall } = useWebRTC();
  const queryClient = useQueryClient();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: convos } = useListConversations({ userId: user?.id ?? 0 });
  const conversation = convos?.find(c => c.id === conversationId);
  const { data: messages = [] } = useListMessages(conversationId, undefined, { query: { refetchInterval: 2000, enabled: !!conversationId, queryKey: [] } as any });
  
  const sendMessageMutation = useSendChatMessage();
  const requestUploadUrl = useRequestUploadUrl();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() || !user) return;
    
    const text = content;
    setContent("");
    
    await sendMessageMutation.mutateAsync({
      conversationId,
      data: { senderId: user.id, content: text, type: "text" }
    });
    queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({
        data: { name: file.name, size: file.size, contentType: file.type }
      });
      
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      let type: "file" | "image" | "video" = "file";
      if (file.type.startsWith("image/")) type = "image";
      if (file.type.startsWith("video/")) type = "video";

      await sendMessageMutation.mutateAsync({
        conversationId,
        data: { senderId: user.id, content: file.name, type, fileUrl: objectPath, fileName: file.name, fileType: file.type }
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

  return (
    <div className="flex-1 flex flex-col h-full relative bg-background/50 backdrop-blur-3xl">
      {/* Header */}
      <div className="h-20 px-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-card/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          {conversation?.type === "dm" ? (
            <Avatar className="h-12 w-12 border-2 border-white/10 shadow-lg">
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: otherUser?.avatarColor }}>
                {otherUser?.displayName.charAt(0).toUpperCase()}
              </div>
            </Avatar>
          ) : (
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg border border-white/10">
              <span className="text-xl font-bold">#</span>
            </div>
          )}
          <div>
            <h3 className="font-display font-bold text-xl">{conversation?.type === "dm" ? otherUser?.displayName : conversation?.name}</h3>
            <p className="text-sm text-muted-foreground">{conversation?.type === "dm" ? `@${otherUser?.username}` : `${conversation?.members.length} members`}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {conversation?.type === "dm" && (
            <Button variant="secondary" size="icon" className="w-12 h-12 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-colors border border-white/10 shadow-lg" onClick={() => otherUser && startCall(conversationId, otherUser.id)}>
              <Video className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll p-8 flex flex-col gap-6">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground opacity-50">
            <p>This is the beginning of the conversation.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            const showAvatar = idx === 0 || messages[idx-1].senderId !== msg.senderId;
            return (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn("flex gap-4 max-w-[75%]", isMe ? "ml-auto flex-row-reverse" : "")}
              >
                {showAvatar ? (
                  <Avatar className="h-10 w-10 shrink-0 mt-auto border border-white/10 shadow-sm">
                    <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: msg.sender.avatarColor }}>
                      {msg.sender.displayName.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                ) : (
                  <div className="w-10 shrink-0" />
                )}
                
                <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium">{msg.sender.displayName}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                    </div>
                  )}
                  <div className={cn("p-4 rounded-3xl shadow-md", isMe ? "bg-primary text-primary-foreground rounded-br-sm shadow-primary/20" : "bg-card border border-white/5 rounded-bl-sm")}>
                    {msg.type === "image" && <img src={getFileUrl(msg.fileUrl)} alt="attachment" className="max-w-xs rounded-xl mb-3 object-cover max-h-64 shadow-inner border border-white/10" />}
                    {msg.type === "video" && <video src={getFileUrl(msg.fileUrl)} controls className="max-w-xs rounded-xl mb-3 max-h-64 shadow-inner border border-white/10" />}
                    {msg.type === "file" && (
                      <a href={getFileUrl(msg.fileUrl)} download className="flex items-center gap-3 p-3 bg-black/30 rounded-xl mb-3 hover:bg-black/40 transition-colors">
                        <FileText className="w-6 h-6 text-primary" />
                        <span className="text-sm font-medium underline underline-offset-2">{msg.fileName}</span>
                      </a>
                    )}
                    {msg.content && msg.type !== "image" && msg.type !== "video" && msg.type !== "file" && (
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 pt-0 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center bg-card/60 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-xl">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button type="button" variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-white/5 shrink-0 text-muted-foreground" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Paperclip className="w-6 h-6" />}
          </Button>
          <Input 
            placeholder="Type a message..." 
            value={content}
            onChange={e => setContent(e.target.value)}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none text-base px-4 placeholder:text-muted-foreground"
          />
          <Button type="submit" disabled={!content.trim() || sendMessageMutation.isPending} size="icon" className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 shrink-0 transition-transform active:scale-95 disabled:opacity-50">
            <Send className="w-5 h-5 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
