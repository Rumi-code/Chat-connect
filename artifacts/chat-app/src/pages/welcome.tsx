import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquareText, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function WelcomePage() {
  const { login } = useAuth();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Decorative Image */}
      <div className="hidden lg:flex flex-1 relative bg-muted overflow-hidden">
        <img 
          src={`${import.meta.env.BASE_URL}images/welcome-bg.png`}
          alt="Abstract background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background" />
        
        <div className="absolute bottom-12 left-12 max-w-md z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-sm mb-4 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Next-gen communication</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-display font-bold text-foreground mb-4 leading-tight"
          >
            Connect instantly with anyone, anywhere.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-lg"
          >
            Experience lightning-fast messaging in a beautifully designed workspace tailored for focus.
          </motion.p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 bg-background relative z-10">
        <div className="w-full max-w-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-xl shadow-primary/20 mb-8"
          >
            <MessageSquareText className="h-8 w-8" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Welcome to ChatApp</h2>
            <p className="text-muted-foreground mb-8">Enter a username to start chatting with your team.</p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-foreground">
                Your Username
              </label>
              <Input 
                id="username"
                autoFocus
                placeholder="e.g. Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 px-4 bg-muted/50 border-border focus-visible:ring-primary focus-visible:bg-background transition-colors text-base rounded-xl"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!name.trim()}
              className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              Continue to Chat
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
