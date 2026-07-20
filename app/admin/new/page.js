// ---------------------------------------------------------------------------
// app/admin/new/page.js  →  the "write a new post" screen, at /admin/new
// ---------------------------------------------------------------------------

"use client";

import AuthGate from "../AuthGate";
import PostForm from "../PostForm";

export default function NewPostPage() {
  return (
    <AuthGate>
      <PostForm mode="create" />
    </AuthGate>
  );
}
