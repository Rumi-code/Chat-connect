import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Send, Users, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useGetMessages, useSendMessage, getGetMessagesQueryKey, useListRooms } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatAreaProps {
  roomId: number;
  username: string;
}

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export function ChatArea({ roomId, username }: ChatAreaProps) {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Fetch room details to show in header
  const { data: rooms } = useListRooms();
  const currentRoom = rooms?.find((r) => r.id === roomId);

  // Poll for messages every 2 seconds
  const { data: messages = [], isLoading: isLoadingMessages } = useGetMessages(
    roomId,
    undefined,
    { query: { refetchInterval: 2000 } }
  );

  const { mutate: sendMessage, isPending: isSending } = useSendMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(roomId) });
        setShouldAutoScroll(true);
      },
    },
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  const onSubmit = (values: z.infer<typeof messageSchema>) => {
    sendMessage({
      roomId,
      data: { username, content: values.content },
    });
    form.reset();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  // Handle manual scroll to disable auto-scroll if user scrolls up
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShouldAutoScroll(isAtBottom);
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-bold text-foreground flex items-center">
              <span className="text-muted-foreground font-normal mr-1">#</span>
              {currentRoom?.name || "Loading..."}
            </h2>
            {currentRoom?.description && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full hidden sm:inline-block">
                {currentRoom.description}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Members">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Channel Info">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto chat-scroll p-6 flex flex-col gap-6"
      >
        {isLoadingMessages && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center animate-pulse">
              <Sparkles className="h-8 w-8 text-primary/40 mb-3" />
              <p>Loading conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Welcome to the start of {currentRoom?.name}!</h3>
              <p className="text-muted-foreground">This is the beginning of your chat history. Say hello to get things started.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-end min-h-full">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isMe = msg.username === username;
                const showAvatar = index === 0 || messages[index - 1].username !== msg.username;
                const date = new Date(msg.createdAt);

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col w-full max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'} mb-1`}
                  >
                    {showAvatar && (
                      <div className={`flex items-baseline gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-xs font-semibold text-foreground/80">{msg.username}</span>
                        <span className="text-[10px] text-muted-foreground">{format(date, 'h:mm a')}</span>
                      </div>
                    )}
                    <div className={`flex gap-3 max-w-full ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {showAvatar ? (
                        <Avatar className="h-8 w-8 shrink-0 shadow-sm border border-border/50">
                          <AvatarFallback className={isMe ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}>
                            {msg.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 shrink-0" />
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                          ${isMe 
                            ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-primary/20' 
                            : 'bg-card border border-border/60 text-foreground rounded-tl-sm hover:border-border transition-colors'
                          }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/95 backdrop-blur shrink-0 border-t border-border/50">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="relative flex items-center max-w-4xl mx-auto"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0">
                  <FormControl>
                    <Input 
                      placeholder={`Message #${currentRoom?.name || 'room'}...`} 
                      autoComplete="off"
                      className="pr-14 h-12 bg-muted/40 border-border/50 focus-visible:ring-primary/20 focus-visible:bg-background rounded-full text-[15px] shadow-inner transition-all duration-200"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isSending || !form.watch("content").trim()}
              className="absolute right-1.5 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
