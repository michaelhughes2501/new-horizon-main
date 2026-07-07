/**
 * AuthContext — thin wrapper around Supabase auth.
 * Session state is persisted to the global Zustand store (AppContext) so
 * every screen can read it without subscribing to context re-renders.
 */
import React, { createContext, useContext, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getProfile,
} from "../services/auth";
import { useAppStore } from "./AppContext";

type AuthContextType = {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setAuthLoading, reset } = useAppStore();

  // ── Restore session and subscribe to auth changes on mount
  useEffect(() => {
    setAuthLoading(true);

    // Bootstrap from existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      setUser(user);
      if (user) {
        const profile = await getProfile(user.id);
        setProfile(profile);
      }
      setAuthLoading(false);
    });

    // Live subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setUser(user);
      if (user) {
        const profile = await getProfile(user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email, password) => {
          const user = await authSignIn(email, password);
          setUser(user);
          const profile = await getProfile(user.id);
          setProfile(profile);
        },
        signUp: async (email, password, username) => {
          const user = await authSignUp(email, password, username);
          setUser(user);
        },
        signOut: async () => {
          await authSignOut();
          reset();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
