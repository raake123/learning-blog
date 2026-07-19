// ---------------------------------------------------------------------------
// app/admin/edit/[slug]/page.js  →  the "edit a post" screen, at /admin/edit/<slug>
//
// This is a client page, so we read the slug from the URL with useParams(),
// load that post, and hand it to the shared PostForm in "edit" mode.
// ---------------------------------------------------------------------------

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGate from "../../AuthGate";
import PostForm from "../../PostForm";
import { getPostBySlug } from "@/lib/posts";

export default function EditPostPage() {
  const { slug } = useParams(); // the slug from the address bar
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostBySlug(slug).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [slug]);

  return (
    <AuthGate>
      <div className="container admin">
        <Link href="/admin" className="back-link">
          ← Back to posts
        </Link>
        <h1 className="admin-title">Edit post</h1>

        {loading ? (
          <p className="admin-sub">Loading…</p>
        ) : post ? (
          <PostForm mode="edit" initial={post} />
        ) : (
          <p className="admin-sub">That post could not be found.</p>
        )}
      </div>
    </AuthGate>
  );
}
