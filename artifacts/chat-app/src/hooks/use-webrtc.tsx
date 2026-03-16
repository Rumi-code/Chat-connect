import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useWebSocket } from "./use-websocket";
import { useAuth } from "./use-auth";

interface WebRTCContextType {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  incomingCall: any | null;
  isCalling: boolean;
  isScreenSharing: boolean;
  startCall: (conversationId: number, targetUserId: number) => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: () => void;
  toggleScreenShare: () => Promise<void>;
}

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export function WebRTCProvider({ children }: { children: ReactNode }) {
  const ws = useWebSocket();
  const { user } = useAuth();
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);

  const initPC = () => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.ontrack = (e) => setRemoteStream(e.streams[0]);
    pc.onicecandidate = (e) => {
      if (e.candidate && activeConversation && ws) {
        ws.send(JSON.stringify({ type: "call-ice-candidate", conversationId: activeConversation, from: user?.id, data: e.candidate }));
      }
    };
    pcRef.current = pc;
    return pc;
  };

  useEffect(() => {
    if (!ws || !user) return;

    const handleMessage = async (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.to !== user.id && msg.to !== "all") return;

        if (msg.type === "call-offer") {
          setIncomingCall(msg);
        } else if (msg.type === "call-answer") {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(msg.data));
        } else if (msg.type === "call-ice-candidate") {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(msg.data));
        } else if (msg.type === "call-end") {
          cleanupCall();
        }
      } catch (err) {}
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [ws, user, activeConversation]);

  const cleanupCall = () => {
    localStream?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
    setIsCalling(false);
    setIsScreenSharing(false);
    setActiveConversation(null);
  };

  const startCall = async (conversationId: number, targetUserId: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCalling(true);
      setActiveConversation(conversationId);

      const pc = initPC();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      ws?.send(JSON.stringify({ type: "call-offer", conversationId, from: user?.id, to: targetUserId, data: offer }));
    } catch (e) {
      console.error("Failed to start call", e);
    }
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCalling(true);
      setActiveConversation(incomingCall.conversationId);

      const pc = initPC();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.data));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      ws?.send(JSON.stringify({ type: "call-answer", conversationId: incomingCall.conversationId, from: user?.id, to: incomingCall.from, data: answer }));
      setIncomingCall(null);
    } catch (e) {
      console.error("Failed to answer", e);
    }
  };

  const endCall = () => {
    if (activeConversation) {
      ws?.send(JSON.stringify({ type: "call-end", conversationId: activeConversation, from: user?.id, to: "all" }));
    }
    cleanupCall();
  };

  const toggleScreenShare = async () => {
    if (!pcRef.current || !localStream) return;
    
    if (isScreenSharing) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTrack = stream.getVideoTracks()[0];
      const sender = pcRef.current.getSenders().find(s => s.track?.kind === "video");
      if (sender) sender.replaceTrack(videoTrack);
      
      setLocalStream(stream);
      setIsScreenSharing(false);
    } else {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoTrack = displayStream.getVideoTracks()[0];
      const sender = pcRef.current.getSenders().find(s => s.track?.kind === "video");
      if (sender) sender.replaceTrack(videoTrack);

      const newStream = new MediaStream([videoTrack, ...localStream.getAudioTracks()]);
      setLocalStream(newStream);
      setIsScreenSharing(true);

      videoTrack.onended = () => {
        toggleScreenShare(); // Revert automatically
      };
    }
  };

  return (
    <WebRTCContext.Provider value={{ localStream, remoteStream, incomingCall, isCalling, isScreenSharing, startCall, answerCall, endCall, toggleScreenShare }}>
      {children}
    </WebRTCContext.Provider>
  );
}

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) throw new Error("useWebRTC must be used within WebRTCProvider");
  return context;
};
