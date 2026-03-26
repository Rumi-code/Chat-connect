import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NexusLogo } from "@/components/nexus-logo";
import { useAuth } from "@/hooks/use-auth";

const features = [
  { icon: Zap, label: "Lightning fast", desc: "Real-time messaging at scale" },
  { icon: Shield, label: "Secure", desc: "End-to-end encrypted conversations" },
  { icon: Users, label: "Collaborative", desc: "Teams, DMs, and AI in one place" },
];

const floatVariant = {
  animate: (i: number) => ({
    y: [0, -10, 0],
    transition: {
      duration: 3 + i * 0.7,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.4,
    },
  }),
};

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
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/20 blur-[150px] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="flex-1 relative hidden lg:flex flex-col justify-between p-16 z-10 border-r border-white/5 bg-black/20 backdrop-blur-3xl">
        <img 
          src={`${import.meta.env.BASE_URL}images/welcome-bg.png`}
          alt="Abstract Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <NexusLogo size={42} animated />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium tracking-wide">Next-gen communication</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-6xl font-display font-extrabold leading-[1.1] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60"
          >
            Connect instantly.<br/>Collaborate freely.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="text-xl text-muted-foreground leading-relaxed mb-12"
          >
            Lightning-fast messaging, crystal-clear video calls, and intelligent AI assistance in one beautifully designed workspace.
          </motion.p>

          <div className="flex flex-col gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + i * 0.12, duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 flex gap-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={floatVariant}
              animate="animate"
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 z-10 min-h-screen md:min-h-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, type: "spring", stiffness: 200, damping: 25 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <NexusLogo size={44} animated />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-card/40 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-2xl"
          >
            <motion.div
              initial={{ rotate: -8, scale: 0.8 }}
              animate={{ rotate: 3, scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 20 }}
              className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-7 shadow-xl shadow-primary/20"
            >
              <NexusLogo size={30} showText={false} />
            </motion.div>

            <h2 className="text-3xl font-display font-bold mb-2">Get Started</h2>
            <p className="text-muted-foreground mb-8">Create your profile to join the network.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold ml-1">Display Name</label>
                <Input 
                  placeholder="e.g. Alex Johnson"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="h-14 px-5 bg-black/20 border-white/10 rounded-2xl text-base focus-visible:ring-primary focus-visible:bg-black/40 transition-all"
                  autoFocus
                  autoComplete="name"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold ml-1">Username</label>
                <Input 
                  placeholder="e.g. alexj"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  className="h-14 px-5 bg-black/20 border-white/10 rounded-2xl text-base focus-visible:ring-primary focus-visible:bg-black/40 transition-all"
                  autoComplete="username"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
              >
                <Button 
                  type="submit" 
                  disabled={!username || !displayName || isLoading}
                  className="w-full h-14 mt-2 rounded-2xl text-base font-bold bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Joining...
                    </div>
                  ) : (
                    <>
                      Continue to App
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
