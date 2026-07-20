// ---------------------------------------------------------------------------
// lib/posts.js
//
// These functions used to return a hardcoded list. Now they ask the real
// Supabase database. Notice the function NAMES didn't change — so the pages
// that use them barely change at all. That's the reward for keeping data
// separate from display back in Phase 2.
//
// Talking to a database takes a moment, so these are now "async" functions
// and the pages will "await" their answers.
// ---------------------------------------------------------------------------

import { supabase } from "./supabase";

// Return every post, newest first.
export async function getAllPosts() {
  const { data, error } = await supabase
    .from("posts") // the table
    .select("*") // all columns
    .order("date", { ascending: false }); // newest first

  if (error) throw error;
  return data;
}

// Return only the posts owned by one user (for their dashboard), newest first.
export async function getMyPosts(userId) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
}

// Find one post by its slug. Returns null if none match.
export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug) // "where slug = ..."
    .maybeSingle(); // expect 0 or 1 row

  if (error) throw error;
  return data; // null if not found
}

// ---- Writing posts (used by the private admin area) ----
// These only succeed for a logged-in user, because the database's security
// rules (RLS) allow writes for authenticated users only. The lock is on the
// database itself, not just the page.

// Turn a title into a URL-friendly slug: "My First Post!" -> "my-first-post"
export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-letters/numbers become dashes
    .replace(/(^-|-$)/g, ""); // trim leading/trailing dashes
}

// Add a brand-new post.
export async function createPost(post) {
  const { error } = await supabase.from("posts").insert(post);
  if (error) throw error;
}

// Change an existing post (found by its slug).
export async function updatePost(slug, fields) {
  const { error } = await supabase.from("posts").update(fields).eq("slug", slug);
  if (error) throw error;
}

// Remove a post permanently.
export async function deletePost(slug) {
  const { error } = await supabase.from("posts").delete().eq("slug", slug);
  if (error) throw error;
}

// Estimate reading time: ~200 words per minute. Always at least "1 min read".
export function readingTime(content) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

// Turn "2026-07-19" into "Jul 19, 2026".
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
