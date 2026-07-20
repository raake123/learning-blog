// ---------------------------------------------------------------------------
// app/components/Nav.js  →  the top navigation bar (auth-aware)
//
//   • Signed out → a "Sign up for free" button
//   • Signed in  → a "Write" link (with icon) + an account avatar menu
//                  (change photo, your posts, sign out)
// The "Write" link and the sign-up button hide inside the admin area, where
// they'd be redundant.
// ---------------------------------------------------------------------------
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { IconPencil } from "./icons";

export default function Nav() {
  const pathname = usePathname() || "";
  const inAdmin = pathname.startsWith("/admin");

  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user || null)
    );
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const name = user?.user_metadata?.name || user?.email || "";
  const avatarUrl = user?.user_metadata?.avatar_url || "";
  const initial = (name || "?").charAt(0).toUpperCase();

  async function changePhoto(e) {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatar-${user.id}-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("covers").upload(path, file);
    if (!up.error) {
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
      const { data: u } = await supabase.auth.getUser();
      setUser(u.user);
    }
    setUploading(false);
  }

  async function signOut() {
    setOpen(false);
    await supabase.auth.signOut();
  }

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="site-name">
          <Logo size={26} />
          <span>The&nbsp;Learning&nbsp;Blog</span>
        </Link>

        <div className="nav-right">
          <ThemeToggle />

          {ready && !user && !inAdmin && (
            <Link href="/admin?join=1" className="nav-write">
              Sign up for free
            </Link>
          )}

          {ready && user && !inAdmin && (
            <Link href="/admin/new" className="nav-link">
              <IconPencil /> Write
            </Link>
          )}

          {ready && user && (
            <div className="nav-account" ref={menuRef}>
              <button
                type="button"
                className="avatar-btn"
                onClick={() => setOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={open}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="avatar-img" />
                ) : (
                  <span className="avatar-initial">{initial}</span>
                )}
              </button>

              {open && (
                <div className="account-menu" role="menu">
                  <div className="account-head">
                    <span className="account-name">{name}</span>
                  </div>
                  <Link href="/admin" className="account-item" onClick={() => setOpen(false)}>
                    Your posts
                  </Link>
                  <label className="account-item">
                    {uploading ? "Uploading…" : avatarUrl ? "Change photo" : "Add photo"}
                    <input type="file" accept="image/*" hidden onChange={changePhoto} />
                  </label>
                  <button type="button" className="account-item danger" onClick={signOut}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
