import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface WSClient {
  userId: number;
  ws: WebSocket;
}

const clients: WSClient[] = [];

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://localhost`);
    const userId = parseInt(url.searchParams.get("userId") || "0", 10);

    if (!userId) {
      ws.close();
      return;
    }

    const existing = clients.findIndex(c => c.userId === userId);
    if (existing !== -1) clients.splice(existing, 1);
    clients.push({ userId, ws });

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        handleMessage(userId, msg);
      } catch {}
    });

    ws.on("close", () => {
      const idx = clients.findIndex(c => c.userId === userId);
      if (idx !== -1) clients.splice(idx, 1);
    });
  });

  return wss;
}

function handleMessage(fromUserId: number, msg: any) {
  if (msg.type === "call-offer" || msg.type === "call-answer" || msg.type === "call-ice-candidate" || msg.type === "call-end") {
    const target = clients.find(c => c.userId === msg.to);
    if (target && target.ws.readyState === WebSocket.OPEN) {
      target.ws.send(JSON.stringify({ ...msg, from: fromUserId }));
    }
  }
}

export function broadcast(payload: object, exceptUserId?: number) {
  const data = JSON.stringify(payload);
  for (const client of clients) {
    if (client.userId === exceptUserId) continue;
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

export function sendToUser(userId: number, payload: object) {
  const client = clients.find(c => c.userId === userId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(payload));
  }
}
