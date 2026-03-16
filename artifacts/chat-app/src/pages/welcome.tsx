import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function WelcomePage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) return;
    setIsLoading(true);
    try {
      await login(username, displayName);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Left side graphics */}
      <div className="flex-1 relative hidden lg:flex flex-col justify-end p-20 z-10 border-r border-white/5 bg-black/20 backdrop-blur-3xl">
        <img 
          src={`${import.meta.env.BASE_URL}images/welcome-bg.png`}
          alt="Abstract Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium tracking-wide">Next-gen communication</span>
          </div>
          <h1 className="text-6xl font-display font-extrabold leading-[1.1] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            Connect instantly.<br/>Collaborate freely.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Experience lightning-fast messaging, crystal-clear video calls, and intelligent AI assistance in a beautifully designed workspace.
          </p>
        </motion.div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex items-center justify-center p-8 z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="bg-card/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary/20 rotate-3">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-display font-bold mb-2">Get Started</h2>
            <p className="text-muted-foreground mb-8">Create your profile to join the network.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Display Name</label>
                <Input 
                  placeholder="e.g. Alex Johnson"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="h-14 px-5 bg-black/20 border-white/10 rounded-2xl text-lg focus-visible:ring-primary focus-visible:bg-black/40 transition-all"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Username</label>
                <Input 
                  placeholder="e.g. alexj"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  className="h-14 px-5 bg-black/20 border-white/10 rounded-2xl text-lg focus-visible:ring-primary focus-visible:bg-black/40 transition-all"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!username || !displayName || isLoading}
                className="w-full h-14 mt-4 rounded-2xl text-lg font-bold bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10 transition-all active:scale-[0.98]"
              >
                {isLoading ? "Joining..." : "Continue to App"}
                {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
