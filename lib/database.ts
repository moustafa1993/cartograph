import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database-types";
import { env } from "@/lib/env";

// Clerk owns the session; Supabase never issues one of its own. Every request
// carries the Clerk session token, so policies can read its claims, including
// the active organization. Built per request because the token is per user.
export async function createDatabaseClient() {
  const { getToken } = await auth();
  return createClient<Database>(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { accessToken: () => getToken() },
  );
}
