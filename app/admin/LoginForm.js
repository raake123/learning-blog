// ---------------------------------------------------------------------------
// app/admin/LoginForm.js  →  email + password sign-in
//
// On submit, we ask Supabase to sign the user in. If it works, AuthGate
// notices the new session and swaps this form for the dashboard automatically.
// ---------------------------------------------------------------------------

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser's default page reload
    setBusy(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
    // On success, AuthGate handles showing the dashboard.
  }

  return (
    <div className="container admin-narrow">
      <h1 className="admin-title">Sign in</h1>
      <p className="admin-sub">Only the author can reach this area.</p>

      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
