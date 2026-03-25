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
    preview: "#18181b",
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
      "--secondary": "240 5% 14%",
      "--secondary-foreground": "0 0% 90%",
      "--popover": "240 10% 8%",
      "--popover-foreground": "0 0% 95%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--input": "240 5% 18%",
      "--ring": "265 89% 58%",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    preview: "#020617",
    vars: {
      "--background": "222 84% 4%",
      "--foreground": "210 100% 96%",
      "--card": "222 84% 7%",
      "--card-foreground": "210 100% 96%",
      "--sidebar": "222 84% 3%",
      "--primary": "217 91% 60%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "199 89% 48%",
      "--muted": "222 40% 14%",
      "--muted-foreground": "215 30% 58%",
      "--border": "222 40% 16%",
      "--secondary": "222 40% 11%",
      "--secondary-foreground": "210 60% 90%",
      "--popover": "222 84% 6%",
      "--popover-foreground": "210 100% 96%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--input": "222 40% 14%",
      "--ring": "217 91% 60%",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    preview: "#042f3a",
    vars: {
      "--background": "195 70% 8%",
      "--foreground": "180 60% 96%",
      "--card": "195 70% 12%",
      "--card-foreground": "180 60% 96%",
      "--sidebar": "195 70% 6%",
      "--primary": "180 100% 45%",
      "--primary-foreground": "195 70% 5%",
      "--accent": "160 84% 39%",
      "--muted": "195 35% 20%",
      "--muted-foreground": "195 25% 58%",
      "--border": "195 35% 22%",
      "--secondary": "195 35% 16%",
      "--secondary-foreground": "180 40% 88%",
      "--popover": "195 70% 10%",
      "--popover-foreground": "180 60% 96%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--input": "195 35% 20%",
      "--ring": "180 100% 45%",
    },
  },
  {
    id: "forest",
    name: "Forest",
    preview: "#052009",
    vars: {
      "--background": "130 50% 5%",
      "--foreground": "120 30% 95%",
      "--card": "130 50% 9%",
      "--card-foreground": "120 30% 95%",
      "--sidebar": "130 50% 4%",
      "--primary": "142 76% 46%",
      "--primary-foreground": "130 50% 4%",
      "--accent": "88 60% 43%",
      "--muted": "130 25% 17%",
      "--muted-foreground": "130 18% 56%",
      "--border": "130 25% 19%",
      "--secondary": "130 25% 13%",
      "--secondary-foreground": "120 20% 88%",
      "--popover": "130 50% 8%",
      "--popover-foreground": "120 30% 95%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--input": "130 25% 17%",
      "--ring": "142 76% 46%",
    },
  },
  {
    id: "rose",
    name: "Rose",
    preview: "#250513",
    vars: {
      "--background": "340 55% 6%",
      "--foreground": "340 20% 96%",
      "--card": "340 55% 10%",
      "--card-foreground": "340 20% 96%",
      "--sidebar": "340 55% 4%",
      "--primary": "336 84% 57%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "316 72% 52%",
      "--muted": "340 25% 18%",
      "--muted-foreground": "340 18% 57%",
      "--border": "340 25% 20%",
      "--secondary": "340 25% 14%",
      "--secondary-foreground": "340 15% 88%",
      "--popover": "340 55% 8%",
      "--popover-foreground": "340 20% 96%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--input": "340 25% 18%",
      "--ring": "336 84% 57%",
    },
  },
  {
    id: "light",
    name: "Light",
    preview: "#f8fafc",
    vars: {
      "--background": "210 20% 98%",
      "--foreground": "224 14% 10%",
      "--card": "0 0% 100%",
      "--card-foreground": "224 14% 10%",
      "--sidebar": "220 15% 94%",
      "--primary": "265 89% 52%",
      "--primary-foreground": "0 0% 100%",
      "--accent": "265 89% 52%",
      "--muted": "220 15% 91%",
      "--muted-foreground": "224 8% 44%",
      "--border": "220 12% 86%",
      "--secondary": "220 15% 91%",
      "--secondary-foreground": "224 14% 20%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "224 14% 10%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--input": "220 12% 88%",
      "--ring": "265 89% 52%",
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
  serverUrl: string;
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
  setServerUrl: (url: string) => void;
}

const Context = createContext<SettingsContext | null>(null);

function hsl(vars: string): string {
  return `hsl(${vars})`;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }

  const colorMap: Record<string, string> = {
    "--background": "--color-background",
    "--foreground": "--color-foreground",
    "--card": "--color-card",
    "--card-foreground": "--color-card-foreground",
    "--sidebar": "--color-sidebar",
    "--primary": "--color-primary",
    "--primary-foreground": "--color-primary-foreground",
    "--accent": "--color-accent",
    "--accent-foreground": "--color-accent-foreground",
    "--muted": "--color-muted",
    "--muted-foreground": "--color-muted-foreground",
    "--border": "--color-border",
    "--secondary": "--color-secondary",
    "--secondary-foreground": "--color-secondary-foreground",
    "--popover": "--color-popover",
    "--popover-foreground": "--color-popover-foreground",
    "--destructive": "--color-destructive",
    "--destructive-foreground": "--color-destructive-foreground",
    "--input": "--color-input",
    "--ring": "--color-ring",
  };

  for (const [key, value] of Object.entries(theme.vars)) {
    const colorVar = colorMap[key];
    if (colorVar) {
      root.style.setProperty(colorVar, hsl(value));
    }
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
  const [serverUrl, setServerUrlState] = useState<string>(() => localStorage.getItem("nexus-server-url") ?? "");

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
  const setServerUrl = (url: string) => {
    const cleaned = url.trim().replace(/\/$/, "");
    setServerUrlState(cleaned);
    if (cleaned) {
      localStorage.setItem("nexus-server-url", cleaned);
    } else {
      localStorage.removeItem("nexus-server-url");
    }
  };

  return (
    <Context.Provider value={{
      themeId, chatBackgrounds, fontSize, bubbleStyle, enterToSend, timestampMode, soundEnabled, compactMode, serverUrl,
      setTheme, setChatBackground, getChatBackground,
      setFontSize, setBubbleStyle, setEnterToSend, setTimestampMode, setSoundEnabled, setCompactMode, setServerUrl,
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
