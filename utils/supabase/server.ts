import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY)."
    );
  }

  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies. This is safe to ignore if you're
          // only calling this in Server Actions / Route Handlers.
        }
      },
    },
  });

  // Defensive check: if this ever fails, something is wrong with imports/runtime.
  if (!(client as { auth?: unknown })?.auth) {
    console.error("Supabase client missing auth", {
      type: typeof client,
      keys:
        client && typeof client === "object"
          ? Object.keys(client as unknown as Record<string, unknown>)
          : null,
    });
    throw new Error("Supabase client missing auth (see server logs).");
  }

  return client;
}
