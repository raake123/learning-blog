// ---------------------------------------------------------------------------
// app/admin/AuthForm.js  →  sign in, create an account, reset a password
//
// Screens (one component):
//   • "signin" → returning users: email + password  (+ "Forgot password?")
//   • "signup" → new users: name + email + password
//   • "sent"   → "check your email and click the confirmation link"
//   • "forgot" → enter email to receive a password-reset link
//
// Both new-account confirmation and password reset use an emailed LINK.
// On sign-in success, AuthGate notices the session and shows the dashboard.
// ---------------------------------------------------------------------------
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthForm() {
  const [mode, setMode] = useState("signin"); // signin | signup | sent | forgot
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

  function go(nextMode) {
    setMode(nextMode);
    resetMessages();
  }

  // --- Returning user: email + password ---
  async function handleSignIn(event) {
    event.preventDefault();
    setBusy(true);
    resetMessages();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
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
      options: { data: { name } },
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    if (data.session) {
      setBusy(false);
      return; // confirmation not required → already signed in
    }
    setMode("sent");
    setBusy(false);
  }

  async function resendLink() {
    resetMessages();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) setError(error.message);
    else setNotice("Sent again — check your inbox.");
  }

  // --- Forgot password: email a reset link back to /admin/reset ---
  async function handleForgot(event) {
    event.preventDefault();
    setBusy(true);
    resetMessages();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset`,
    });
    setBusy(false);
    if (error) setError(error.message);
    else
      setNotice(
        "If an account exists for that email, a reset link is on its way."
      );
  }

  // ----------------------------- "Check email" -----------------------------
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
          <button className="btn-primary" onClick={() => go("signin")}>
            Back to sign in
          </button>
          <button type="button" className="btn-ghost" onClick={resendLink}>
            Resend link
          </button>
        </div>
      </div>
    );
  }

  // --------------------------- Forgot password ---------------------------
  if (mode === "forgot") {
    return (
      <div className="container admin-narrow">
        <h1 className="admin-title">Reset your password</h1>
        <p className="admin-sub">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>
        <form onSubmit={handleForgot} className="admin-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {notice && <p className="auth-notice">{notice}</p>}
          {error && <p className="form-error">{error}</p>}
          <button className="btn-primary" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <p className="auth-switch">
          Remembered it?{" "}
          <button type="button" className="auth-link" onClick={() => go("signin")}>
            Back to sign in
          </button>
        </p>
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

        {/* Forgot-password link only makes sense when signing in. */}
        {!signingUp && (
          <button
            type="button"
            className="auth-link auth-forgot"
            onClick={() => go("forgot")}
          >
            Forgot password?
          </button>
        )}

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
          onClick={() => go(signingUp ? "signin" : "signup")}
        >
          {signingUp ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}
