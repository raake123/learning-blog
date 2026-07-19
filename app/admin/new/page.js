// ---------------------------------------------------------------------------
// app/admin/new/page.js  →  the "write a new post" screen, at /admin/new
// ---------------------------------------------------------------------------

"use client";

import Link from "next/link";
import AuthGate from "../AuthGate";
import PostForm from "../PostForm";

export default function NewPostPage() {
  return (
    <AuthGate>
      <div className="container admin">
        <Link href="/admin" className="back-link">
          ← Back to posts
        </Link>
        <h1 className="admin-title">New post</h1>
        <PostForm mode="create" />
      </div>
    </AuthGate>
  );
}
