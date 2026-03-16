import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

const WebSocketContext = createContext<WebSocket | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws?userId=${user.id}`);

    socket.onopen = () => console.log("[WS] Connected");
    socket.onclose = () => console.log("[WS] Disconnected");

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        // Real-time invalidations
        if (data.type === "new-message") {
          queryClient.invalidateQueries({ queryKey: [`/api/conversations/${data.conversationId}/messages`] });
          queryClient.invalidateQueries({ queryKey: [`/api/conversations`] });
        }
      } catch (err) {
        // Ignore JSON parse errors for non-JSON messages
      }
    });

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [user, queryClient]);

  return <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>;
}

export const useWebSocket = () => useContext(WebSocketContext);
