// ---------------------------------------------------------------------------
// app/admin/reset/page.js  →  set a new password (at /admin/reset)
//
// The password-reset email links here. Clicking that link puts a temporary
// "recovery" session in place, which lets us call updateUser() to change the
// password. If someone lands here without a valid link, we say so.
// ---------------------------------------------------------------------------
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false); // do we have a recovery session?
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The recovery link creates a session; detect it (now or as it arrives).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    setDone(true);
  }

  // Success — the user is now signed in with the new password.
  if (done) {
    return (
      <div className="container admin-narrow">
        <h1 className="admin-title">Password updated</h1>
        <p className="admin-sub">You&apos;re all set and signed in.</p>
        <div className="form-actions">
          <button className="btn-primary" onClick={() => router.push("/admin")}>
            Go to your posts
          </button>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="container admin-narrow">
        <p className="admin-sub">Checking your reset link…</p>
      </div>
    );
  }

  // Landed here without a valid/active recovery link.
  if (!ready) {
    return (
      <div className="container admin-narrow">
        <h1 className="admin-title">Link expired</h1>
        <p className="admin-sub">
          This password-reset link is invalid or has expired. Request a new one
          from the sign-in screen.
        </p>
        <div className="form-actions">
          <Link href="/admin" className="btn-primary">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // Valid recovery session → let them choose a new password.
  return (
    <div className="container admin-narrow">
      <h1 className="admin-title">Set a new password</h1>
      <p className="admin-sub">Choose a new password for your account.</p>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            autoFocus
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
