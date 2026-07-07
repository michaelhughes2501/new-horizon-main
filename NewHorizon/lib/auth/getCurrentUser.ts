import { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

/**
 * Returns the currently authenticated user, or null if there is no active
 * session. Use this when authentication is optional (e.g. to conditionally
 * show UI elements). Use requireUser() when the operation requires auth.
 */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
