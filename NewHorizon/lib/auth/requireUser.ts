import { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Returns the currently authenticated user.
 * Throws AuthenticationError if no valid session exists.
 */
export async function requireUser(): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new AuthenticationError(error.message);
  }

  if (!user) {
    throw new AuthenticationError();
  }

  return user;
}
