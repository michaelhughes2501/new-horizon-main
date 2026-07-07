/**
 * Global application state — Zustand store.
 *
 * Keeps the current user, profile, notifications, active conversations,
 * AI assistant state, and theme in one place so every screen reads from
 * a single source of truth and UI stays synchronised automatically.
 */
import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "../../lib/types";
import type { AppNotification } from "../services/notifications";
import type { Conversation } from "../services/messaging";
import type { AssistantMessage, AssistantTopic } from "../services/ai";

// ─── Theme ──────────────────────────────────────────────────────────────────
export type ThemeMode = "dark" | "light";

export const THEME = {
  dark: {
    background: "#1a1a2e",
    surface: "#16213e",
    border: "#0f3460",
    accent: "#e94560",
    textPrimary: "#ffffff",
    textSecondary: "#aab4d4",
    textMuted: "#6b7a99",
  },
  light: {
    background: "#f4f6fb",
    surface: "#ffffff",
    border: "#e2e8f0",
    accent: "#e94560",
    textPrimary: "#1a1a2e",
    textSecondary: "#4a5568",
    textMuted: "#a0aec0",
  },
} as const;

// ─── AI assistant slice ──────────────────────────────────────────────────────
export interface AssistantState {
  history: AssistantMessage[];
  topic: AssistantTopic;
  loading: boolean;
  error: string | null;
}

// ─── Store shape ─────────────────────────────────────────────────────────────
export interface AppState {
  // Auth
  user: User | null;
  profile: Profile | null;
  authLoading: boolean;

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;

  // Messaging
  conversations: Conversation[];

  // AI assistant
  assistant: AssistantState;

  // Theme / settings
  theme: ThemeMode;
  colors: (typeof THEME)[ThemeMode];

  // Setters
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setAuthLoading: (loading: boolean) => void;

  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (notification: AppNotification) => void;
  markNotificationRead: (id: string) => void;

  setConversations: (conversations: Conversation[]) => void;

  setAssistantHistory: (history: AssistantMessage[]) => void;
  setAssistantTopic: (topic: AssistantTopic) => void;
  setAssistantLoading: (loading: boolean) => void;
  setAssistantError: (error: string | null) => void;
  clearAssistant: () => void;

  setTheme: (theme: ThemeMode) => void;
  reset: () => void;
}

const defaultAssistant: AssistantState = {
  history: [],
  topic: "general",
  loading: false,
  error: null,
};

export const useAppStore = create<AppState>((set) => ({
  // ── Auth
  user: null,
  profile: null,
  authLoading: true,

  // ── Notifications
  notifications: [],
  unreadCount: 0,

  // ── Messaging
  conversations: [],

  // ── AI
  assistant: defaultAssistant,

  // ── Theme
  theme: "dark",
  colors: THEME.dark,

  // ── Auth setters
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAuthLoading: (authLoading) => set({ authLoading }),

  // ── Notification setters
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),
  markNotificationRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    }),

  // ── Messaging setters
  setConversations: (conversations) => set({ conversations }),

  // ── AI assistant setters
  setAssistantHistory: (history) =>
    set((state) => ({ assistant: { ...state.assistant, history } })),
  setAssistantTopic: (topic) =>
    set((state) => ({ assistant: { ...state.assistant, topic } })),
  setAssistantLoading: (loading) =>
    set((state) => ({ assistant: { ...state.assistant, loading } })),
  setAssistantError: (error) =>
    set((state) => ({ assistant: { ...state.assistant, error } })),
  clearAssistant: () => set({ assistant: defaultAssistant }),

  // ── Theme setter
  setTheme: (theme) => set({ theme, colors: THEME[theme] }),

  // ── Full reset on sign-out
  reset: () =>
    set({
      user: null,
      profile: null,
      authLoading: false,
      notifications: [],
      unreadCount: 0,
      conversations: [],
      assistant: defaultAssistant,
    }),
}));
