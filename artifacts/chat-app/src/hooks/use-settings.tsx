import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeId = "dark" | "light" | "midnight" | "ocean" | "forest" | "rose";
export type FontSize = "sm" | "md" | "lg";
export type BubbleStyle = "rounded" | "square" | "pill";
export type TimestampMode = "always" | "hover" | "never";

export interface Theme {
  id: ThemeId;
  name: string;
  preview: string;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: "dark",
    name: "Dark",
    preview: "bg-zinc-900",
    vars: {
      "--background": "240 10% 6%",
      "--foreground": "0 0% 95%",
      "--card": "240 10% 9%",
      "--card-foreground": "0 0% 95%",
      "--sidebar": "240 10% 5%",
      "--primary": "265 89% 58%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "265 89% 68%",
      "--muted": "240 5% 18%",
      "--muted-foreground": "240 5% 60%",
      "--border": "240 5% 18%",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    preview: "bg-slate-950",
    vars: {
      "--background": "222 47% 5%",
      "--foreground": "210 40% 95%",
      "--card": "222 47% 8%",
      "--card-foreground": "210 40% 95%",
      "--sidebar": "222 47% 4%",
      "--primary": "213 94% 58%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "213 94% 68%",
      "--muted": "222 20% 16%",
      "--muted-foreground": "215 20% 55%",
      "--border": "222 20% 16%",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    preview: "bg-cyan-950",
    vars: {
      "--background": "197 60% 6%",
      "--foreground": "197 30% 95%",
      "--card": "197 60% 9%",
      "--card-foreground": "197 30% 95%",
      "--sidebar": "197 60% 5%",
      "--primary": "185 96% 42%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "185 96% 52%",
      "--muted": "197 25% 18%",
      "--muted-foreground": "197 20% 55%",
      "--border": "197 25% 18%",
    },
  },
  {
    id: "forest",
    name: "Forest",
    preview: "bg-green-950",
    vars: {
      "--background": "138 40% 5%",
      "--foreground": "138 20% 93%",
      "--card": "138 40% 8%",
      "--card-foreground": "138 20% 93%",
      "--sidebar": "138 40% 4%",
      "--primary": "142 71% 45%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "142 71% 55%",
      "--muted": "138 20% 16%",
      "--muted-foreground": "138 15% 55%",
      "--border": "138 20% 16%",
    },
  },
  {
    id: "rose",
    name: "Rose",
    preview: "bg-rose-950",
    vars: {
      "--background": "345 40% 5%",
      "--foreground": "345 20% 95%",
      "--card": "345 40% 8%",
      "--card-foreground": "345 20% 95%",
      "--sidebar": "345 40% 4%",
      "--primary": "346 77% 55%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "346 77% 65%",
      "--muted": "345 20% 16%",
      "--muted-foreground": "345 15% 55%",
      "--border": "345 20% 16%",
    },
  },
  {
    id: "light",
    name: "Light",
    preview: "bg-white",
    vars: {
      "--background": "0 0% 98%",
      "--foreground": "240 10% 8%",
      "--card": "0 0% 100%",
      "--card-foreground": "240 10% 8%",
      "--sidebar": "240 5% 94%",
      "--primary": "265 89% 58%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "265 89% 58%",
      "--muted": "240 5% 90%",
      "--muted-foreground": "240 5% 45%",
      "--border": "240 5% 85%",
    },
  },
];

export const CHAT_BACKGROUNDS = [
  { id: "default", name: "Default", value: "" },
  { id: "gradient-purple", name: "Purple Haze", value: "linear-gradient(135deg, #1a0533 0%, #0f0f1a 50%, #0a1a2e 100%)" },
  { id: "gradient-ocean", name: "Deep Ocean", value: "linear-gradient(135deg, #001e3c 0%, #0a1628 50%, #0f2a3f 100%)" },
  { id: "gradient-forest", name: "Dark Forest", value: "linear-gradient(135deg, #0a1f0a 0%, #0f1a0f 50%, #162b16 100%)" },
  { id: "gradient-rose", name: "Midnight Rose", value: "linear-gradient(135deg, #1f0a14 0%, #1a0f14 50%, #2b0a16 100%)" },
  { id: "gradient-sunset", name: "Sunset", value: "linear-gradient(135deg, #1a0a00 0%, #1f0a0a 50%, #1a0f0f 100%)" },
  { id: "dots", name: "Dot Grid", value: "dots" },
  { id: "grid", name: "Grid Lines", value: "grid" },
];

interface SettingsState {
  themeId: ThemeId;
  chatBackgrounds: Record<number, string>;
  fontSize: FontSize;
  bubbleStyle: BubbleStyle;
  enterToSend: boolean;
  timestampMode: TimestampMode;
  soundEnabled: boolean;
  compactMode: boolean;
}

interface SettingsContext extends SettingsState {
  setTheme: (id: ThemeId) => void;
  setChatBackground: (conversationId: number, backgroundId: string) => void;
  getChatBackground: (conversationId: number) => string;
  setFontSize: (size: FontSize) => void;
  setBubbleStyle: (style: BubbleStyle) => void;
  setEnterToSend: (value: boolean) => void;
  setTimestampMode: (mode: TimestampMode) => void;
  setSoundEnabled: (value: boolean) => void;
  setCompactMode: (value: boolean) => void;
}

const Context = createContext<SettingsContext | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => load("nexus-theme", "dark"));
  const [chatBackgrounds, setChatBackgrounds] = useState<Record<number, string>>(() => load("nexus-chat-backgrounds", {}));
  const [fontSize, setFontSizeState] = useState<FontSize>(() => load("nexus-font-size", "md"));
  const [bubbleStyle, setBubbleStyleState] = useState<BubbleStyle>(() => load("nexus-bubble-style", "rounded"));
  const [enterToSend, setEnterToSendState] = useState<boolean>(() => load("nexus-enter-to-send", true));
  const [timestampMode, setTimestampModeState] = useState<TimestampMode>(() => load("nexus-timestamp-mode", "always"));
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => load("nexus-sound-enabled", false));
  const [compactMode, setCompactModeState] = useState<boolean>(() => load("nexus-compact-mode", false));

  useEffect(() => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    applyTheme(theme);
    save("nexus-theme", themeId);
  }, [themeId]);

  const setTheme = (id: ThemeId) => setThemeId(id);

  const setChatBackground = (conversationId: number, backgroundId: string) => {
    setChatBackgrounds(prev => {
      const next = { ...prev, [conversationId]: backgroundId };
      save("nexus-chat-backgrounds", next);
      return next;
    });
  };

  const getChatBackground = (conversationId: number) => chatBackgrounds[conversationId] || "default";

  const setFontSize = (size: FontSize) => { setFontSizeState(size); save("nexus-font-size", size); };
  const setBubbleStyle = (style: BubbleStyle) => { setBubbleStyleState(style); save("nexus-bubble-style", style); };
  const setEnterToSend = (v: boolean) => { setEnterToSendState(v); save("nexus-enter-to-send", v); };
  const setTimestampMode = (m: TimestampMode) => { setTimestampModeState(m); save("nexus-timestamp-mode", m); };
  const setSoundEnabled = (v: boolean) => { setSoundEnabledState(v); save("nexus-sound-enabled", v); };
  const setCompactMode = (v: boolean) => { setCompactModeState(v); save("nexus-compact-mode", v); };

  return (
    <Context.Provider value={{
      themeId, chatBackgrounds, fontSize, bubbleStyle, enterToSend, timestampMode, soundEnabled, compactMode,
      setTheme, setChatBackground, getChatBackground,
      setFontSize, setBubbleStyle, setEnterToSend, setTimestampMode, setSoundEnabled, setCompactMode,
    }}>
      {children}
    </Context.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
