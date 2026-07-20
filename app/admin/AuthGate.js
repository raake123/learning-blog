// ---------------------------------------------------------------------------
// app/admin/AuthGate.js  →  the "bouncer" for the admin area
//
// It checks whether someone is logged in. If not, it shows the login form.
// If yes, it shows whatever it's wrapping (the dashboard, a form, etc).
// "use client" means this runs in the browser, where login state lives.
// ---------------------------------------------------------------------------

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AuthForm from "./AuthForm";

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Ask Supabase: is someone already logged in?
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    // Also listen for future login/logout so the screen updates instantly.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="container admin">
        <p className="admin-sub">Checking sign-in…</p>
      </div>
    );
  }

  // Not logged in → show the auth screen. Logged in → show the protected content.
  if (!session) return <AuthForm />;
  return children;
}
