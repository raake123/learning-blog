// ---------------------------------------------------------------------------
// app/admin/PostForm.js  →  the shared form for creating AND editing a post
//
// One form, two modes:
//   mode="create" → makes a new post
//   mode="edit"   → updates an existing one (passed in as `initial`)
//
// It also handles uploading a cover image to Supabase Storage.
// ---------------------------------------------------------------------------

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createPost, updatePost, slugify } from "@/lib/posts";
import BlockEditor, { normalizeBlocks, blocksToPlainText } from "./BlockEditor";

const DEFAULT_COVER = "/covers/default.svg";

export default function PostForm({ mode, initial }) {
  const router = useRouter();

  // Each field is a piece of state, pre-filled from `initial` when editing.
  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  // Content is now a list of sections (blocks). For older posts that only have
  // plain `content`, turn each paragraph into a Text block so they stay editable.
  const initialBlocks = initial?.blocks?.length
    ? initial.blocks
    : initial?.content
    ? initial.content.split("\n\n").filter(Boolean).map((t) => ({ type: "paragraph", text: t }))
    : null;
  const [blocks, setBlocks] = useState(() => normalizeBlocks(initialBlocks));
  const [cover, setCover] = useState(initial?.cover || DEFAULT_COVER);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // When a file is chosen: upload it to Storage, then remember its public link.
  async function handleCoverChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    // A unique file name so uploads never overwrite each other.
    const extension = file.name.split(".").pop();
    const path = `cover-${Date.now()}.${extension}`;

    // Upload into the "covers" storage bucket.
    const upload = await supabase.storage.from("covers").upload(path, file);
    if (upload.error) {
      setError(upload.error.message);
      setUploading(false);
      return;
    }

    // Get the public web address of the uploaded image and use it as the cover.
    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    setCover(data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      if (mode === "create") {
        // Who's writing? Use their account for the byline and ownership.
        const { data: { user } } = await supabase.auth.getUser();
        await createPost({
          slug: slugify(title),
          title,
          category,
          excerpt,
          blocks, // the sections that make up the post
          content: blocksToPlainText(blocks) || title, // plain-text fallback
          cover, // the uploaded image, or the default gradient
          author: user?.user_metadata?.name || user?.email || "Anonymous",
          user_id: user?.id, // the database also defaults this to auth.uid()
          date: new Date().toISOString().slice(0, 10), // today, as YYYY-MM-DD
        });
      } else {
        // Editing keeps the same slug/date but can change everything else.
        await updatePost(initial.slug, {
          title,
          category,
          excerpt,
          cover,
          blocks,
          content: blocksToPlainText(blocks) || title,
        });
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Category
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Personal"
        />
      </label>

      {/* Cover image: shows a preview, plus a button to upload a new one. */}
      <div className="cover-field">
        <span className="cover-label">Cover image</span>
        {/* Preview uses a plain img so it works for both uploads and gradients. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="Cover preview" className="cover-preview" />
        <div className="cover-controls">
          <label className="btn-ghost cover-upload-btn">
            {uploading ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              disabled={uploading}
              hidden
            />
          </label>
          {cover !== DEFAULT_COVER && (
            <button
              type="button"
              className="link-muted"
              onClick={() => setCover(DEFAULT_COVER)}
            >
              Reset to default
            </button>
          )}
        </div>
      </div>

      <label>
        Excerpt
        <textarea
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A one-line summary shown on the homepage."
        />
      </label>
      <div className="field-block">
        <span className="cover-label">Content</span>
        <BlockEditor blocks={blocks} onChange={setBlocks} />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button className="btn-primary" disabled={busy || uploading}>
          {busy ? "Saving…" : mode === "create" ? "Publish post" : "Save changes"}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => router.push("/admin")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
