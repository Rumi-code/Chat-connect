import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useAiStream(conversationId: number) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentChunk, setCurrentChunk] = useState("");

  const sendMessage = async (content: string) => {
    setIsStreaming(true);
    setCurrentChunk("");
    
    try {
      const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.body) throw new Error("No response body");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setCurrentChunk(prev => prev + data.content);
              }
              if (data.done) {
                // Refresh the messages list when stream completes
                queryClient.invalidateQueries({ queryKey: [`/api/openai/conversations/${conversationId}`] });
              }
            } catch (e) {
              // Ignore partial chunks
            }
          }
        }
      }
    } catch (e) {
      console.error("AI stream error", e);
    } finally {
      setIsStreaming(false);
      setCurrentChunk("");
    }
  };

  return { sendMessage, isStreaming, currentChunk };
}
