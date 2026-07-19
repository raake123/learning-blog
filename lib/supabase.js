// ---------------------------------------------------------------------------
// lib/supabase.js  →  our connection to the database
//
// createClient() opens a connection using the URL + key from .env.local.
// We make it once here and share it everywhere, instead of reconnecting
// in every file.
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
