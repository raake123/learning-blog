// ---------------------------------------------------------------------------
// app/admin/Dashboard.js  →  the list of posts with manage actions
//
// Shows every post with View / Edit / Delete, a "New post" button, and Sign out.
// ---------------------------------------------------------------------------

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getAllPosts, deletePost, formatDate } from "@/lib/posts";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Load the posts (and who's signed in) when the dashboard opens.
  async function load() {
    setLoading(true);
    const data = await getAllPosts();
    setPosts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
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
          <p className="admin-sub">Signed in as {email}</p>
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
