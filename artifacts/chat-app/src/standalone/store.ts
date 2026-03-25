export interface LocalUser {
  name: string;
  apiKey: string;
  avatarColor: string;
}

export interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface LocalConversation {
  id: string;
  title: string;
  createdAt: string;
  messages: LocalMessage[];
}

const COLORS = ["#6366f1","#8b5cf6","#ec4899","#f43f5e","#f97316","#eab308","#22c55e","#14b8a6","#3b82f6","#06b6d4"];

function key(k: string) { return `flare:${k}`; }

export function getUser(): LocalUser | null {
  try { return JSON.parse(localStorage.getItem(key("user")) || "null"); } catch { return null; }
}
export function saveUser(u: LocalUser) {
  localStorage.setItem(key("user"), JSON.stringify(u));
}
export function createUser(name: string, apiKey: string): LocalUser {
  const user: LocalUser = { name, apiKey, avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)] };
  saveUser(user);
  return user;
}

export function getConversations(): LocalConversation[] {
  try { return JSON.parse(localStorage.getItem(key("conversations")) || "[]"); } catch { return []; }
}
function saveConversations(convos: LocalConversation[]) {
  localStorage.setItem(key("conversations"), JSON.stringify(convos));
}
export function createConversation(title = "New Chat"): LocalConversation {
  const c: LocalConversation = { id: Date.now().toString(), title, createdAt: new Date().toISOString(), messages: [] };
  const convos = getConversations();
  convos.unshift(c);
  saveConversations(convos);
  return c;
}
export function getConversation(id: string): LocalConversation | null {
  return getConversations().find(c => c.id === id) || null;
}
export function addMessage(conversationId: string, msg: Omit<LocalMessage, "id" | "createdAt">): LocalMessage {
  const convos = getConversations();
  const conv = convos.find(c => c.id === conversationId);
  if (!conv) throw new Error("Conversation not found");
  const m: LocalMessage = { ...msg, id: Date.now().toString() + Math.random(), createdAt: new Date().toISOString() };
  conv.messages.push(m);
  if (conv.messages.length === 2 && conv.title === "New Chat") {
    conv.title = conv.messages[0].content.slice(0, 40) + (conv.messages[0].content.length > 40 ? "…" : "");
  }
  saveConversations(convos);
  return m;
}
export function deleteConversation(id: string) {
  saveConversations(getConversations().filter(c => c.id !== id));
}

export function getSettings() {
  try { return JSON.parse(localStorage.getItem(key("settings")) || "{}"); } catch { return {}; }
}
export function saveSetting(k2: string, v: unknown) {
  const s = getSettings();
  s[k2] = v;
  localStorage.setItem(key("settings"), JSON.stringify(s));
}
