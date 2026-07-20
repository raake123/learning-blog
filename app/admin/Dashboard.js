// ---------------------------------------------------------------------------
// app/admin/Dashboard.js  →  the list of posts with manage actions
//
// Shows every post with View / Edit / Delete, a "New post" button, and Sign out.
// ---------------------------------------------------------------------------

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getMyPosts, deletePost, formatDate } from "@/lib/posts";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // Load THIS user's posts (and who's signed in) when the dashboard opens.
  async function load() {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    setName(data.user?.user_metadata?.name || data.user?.email || "");
    const mine = data.user ? await getMyPosts(data.user.id) : [];
    setPosts(mine);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(slug, title) {
    // A simple confirmation so nothing is deleted by accident.
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deletePost(slug);
    load(); // refresh the list
  }

  return (
    <div className="container admin">
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Your posts</h1>
          <p className="admin-sub">Signed in as {name}</p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/new" className="btn-primary">
            ＋ New post
          </Link>
          <button className="btn-ghost" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>

      {loading ? (
        <p className="admin-sub">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="admin-sub">
          You haven&apos;t written anything yet. Hit “New post” to publish your first one.
        </p>
      ) : (
        <ul className="admin-list">
          {posts.map((post) => (
            <li key={post.slug} className="admin-row">
              <div className="admin-row-info">
                <span className="admin-row-title">{post.title}</span>
                <span className="admin-row-meta">
                  {post.category} · {formatDate(post.date)}
                </span>
              </div>
              <div className="admin-row-actions">
                <Link href={`/posts/${post.slug}`} className="link-muted">
                  View
                </Link>
                <Link href={`/admin/edit/${post.slug}`} className="link-muted">
                  Edit
                </Link>
                <button
                  className="link-danger"
                  onClick={() => handleDelete(post.slug, post.title)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
