// ---------------------------------------------------------------------------
// app/admin/AuthForm.js  →  sign in, create an account, verify by email link
//
// Three little screens in one component:
//   • "signin" → returning users: email + password
//   • "signup" → new users: name + email + password
//   • "sent"   → "check your email and click the confirmation link"
//
// New accounts must confirm their email (Supabase emails a confirmation link).
// After clicking it, they come back here and sign in. On success, AuthGate
// notices the session and shows the dashboard.
// ---------------------------------------------------------------------------
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthForm() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "sent"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  function resetMessages() {
    setError(null);
    setNotice(null);
  }

  // --- Returning user: email + password ---
  async function handleSignIn(event) {
    event.preventDefault();
    setBusy(true);
    resetMessages();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Friendlier message for the most common case.
      setError(
        error.message === "Email not confirmed"
          ? "Please confirm your email first — check your inbox for the link."
          : error.message
      );
      setBusy(false);
    }
    // Success → AuthGate swaps this out for the dashboard.
  }

  // --- New user: create account → Supabase emails a confirmation link ---
  async function handleSignUp(event) {
    event.preventDefault();
    setBusy(true);
    resetMessages();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }, // saved as the author's display name
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    // If the project doesn't require confirmation, we're already logged in.
    if (data.session) {
      setBusy(false);
      return; // AuthGate takes over
    }

    // Otherwise a confirmation link was emailed — show the "check email" screen.
    setMode("sent");
    setBusy(false);
  }

  async function resendLink() {
    resetMessages();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) setError(error.message);
    else setNotice("Sent again — check your inbox.");
  }

  // --------------------------- "Check your email" ---------------------------
  if (mode === "sent") {
    return (
      <div className="container admin-narrow">
        <h1 className="admin-title">Check your email</h1>
        <p className="admin-sub">
          We sent a confirmation link to <strong>{email}</strong>. Click it to
          verify your account, then come back here and sign in.
        </p>

        {notice && <p className="auth-notice">{notice}</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button
            className="btn-primary"
            onClick={() => {
              setMode("signin");
              resetMessages();
            }}
          >
            Back to sign in
          </button>
          <button type="button" className="btn-ghost" onClick={resendLink}>
            Resend link
          </button>
        </div>
      </div>
    );
  }

  // --------------------------- Sign in / Sign up ---------------------------
  const signingUp = mode === "signup";

  return (
    <div className="container admin-narrow">
      <h1 className="admin-title">{signingUp ? "Create your account" : "Sign in"}</h1>
      <p className="admin-sub">
        {signingUp
          ? "Anyone can join and publish their own posts."
          : "Sign in to write and manage your posts."}
      </p>

      <form onSubmit={signingUp ? handleSignUp : handleSignIn} className="admin-form">
        {signingUp && (
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shown as your byline"
              required
            />
          </label>
        )}
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
            minLength={6}
            required
          />
        </label>

        {notice && <p className="auth-notice">{notice}</p>}
        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary" disabled={busy}>
          {busy
            ? signingUp
              ? "Creating account…"
              : "Signing in…"
            : signingUp
            ? "Create account"
            : "Sign in"}
        </button>
      </form>

      <p className="auth-switch">
        {signingUp ? "Already have an account?" : "New here?"}{" "}
        <button
          type="button"
          className="auth-link"
          onClick={() => {
            setMode(signingUp ? "signin" : "signup");
            resetMessages();
          }}
        >
          {signingUp ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}
