import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video, MonitorUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebRTC } from "@/hooks/use-webrtc";

export function VideoCallOverlay() {
  const { localStream, remoteStream, incomingCall, isCalling, answerCall, endCall, toggleScreenShare, isScreenSharing } = useWebRTC();

  return (
    <AnimatePresence>
      {incomingCall && !isCalling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-card/90 border border-white/10 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm w-full backdrop-blur-xl"
          >
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping" />
              <Phone className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">Incoming Call</h3>
            <p className="text-muted-foreground mb-8">User #{incomingCall.from} is calling you</p>
            <div className="flex gap-6 w-full px-4">
              <Button variant="destructive" className="flex-1 h-14 rounded-2xl text-lg shadow-lg shadow-destructive/20 hover:scale-105 transition-transform" onClick={endCall}>
                <PhoneOff className="mr-2" /> Decline
              </Button>
              <Button className="flex-1 h-14 rounded-2xl text-lg bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 hover:scale-105 transition-transform" onClick={answerCall}>
                <Video className="mr-2" /> Accept
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {isCalling && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          drag
          dragMomentum={false}
          className="fixed top-6 right-6 w-80 h-48 bg-black rounded-3xl shadow-2xl overflow-hidden z-[90] border border-white/10 flex flex-col group cursor-move"
        >
          {/* Remote Video (Full) */}
          <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
            {remoteStream ? (
              <video autoPlay playsInline ref={v => { if (v) v.srcObject = remoteStream }} className="w-full h-full object-cover" />
            ) : (
              <span className="text-muted-foreground font-medium animate-pulse">Connecting...</span>
            )}
          </div>

          {/* Local Video (Small Corner) */}
          <div className="absolute bottom-4 right-4 w-24 h-32 bg-black rounded-xl overflow-hidden border border-white/20 shadow-xl z-10">
            <video autoPlay playsInline muted ref={v => { if (v) v.srcObject = localStream }} className="w-full h-full object-cover" />
          </div>

          {/* Controls (Hover) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5 gap-3 z-20">
            <Button size="icon" variant="secondary" className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10" onClick={toggleScreenShare} title={isScreenSharing ? "Stop Sharing" : "Share Screen"}>
              {isScreenSharing ? <MonitorUp className="text-primary" /> : <MonitorUp className="text-white" />}
            </Button>
            <Button size="icon" variant="destructive" className="rounded-full w-12 h-12 shadow-lg shadow-destructive/40" onClick={endCall} title="End Call">
              <PhoneOff className="text-white" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
