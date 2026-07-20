// ---------------------------------------------------------------------------
// app/admin/PostForm.js  →  the post editor (create AND edit)
//
// Laid out like a real writing tool: a top action bar (Publish / Cancel), a
// compact optional cover, a large inline title, a one-line meta row for
// category + summary, then the writing canvas (BlockEditor) front and centre.
// ---------------------------------------------------------------------------
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createPost, updatePost, slugify } from "@/lib/posts";
import BlockEditor, { normalizeBlocks, blocksToPlainText } from "./BlockEditor";

const DEFAULT_COVER = "/covers/default.svg";

export default function PostForm({ mode, initial }) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [cover, setCover] = useState(initial?.cover || DEFAULT_COVER);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const initialBlocks = initial?.blocks?.length
    ? initial.blocks
    : initial?.content
    ? initial.content.split("\n\n").filter(Boolean).map((t) => ({ type: "paragraph", text: t }))
    : null;
  const [blocks, setBlocks] = useState(() => normalizeBlocks(initialBlocks));

  const hasCover = cover && cover !== DEFAULT_COVER;

  async function handleCoverChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const extension = file.name.split(".").pop();
    const path = `cover-${Date.now()}.${extension}`;
    const upload = await supabase.storage.from("covers").upload(path, file);
    if (upload.error) {
      setError(upload.error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    setCover(data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give your post a title first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === "create") {
        const { data: { user } } = await supabase.auth.getUser();
        await createPost({
          slug: slugify(title),
          title,
          category,
          excerpt,
          blocks,
          content: blocksToPlainText(blocks) || title,
          cover,
          author: user?.user_metadata?.name || user?.email || "Anonymous",
          user_id: user?.id,
          date: new Date().toISOString().slice(0, 10),
        });
      } else {
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
    <form className="editor-page" onSubmit={handleSubmit}>
      <div className="container">
        {/* Action bar */}
        <div className="ep-top">
          <Link href="/admin" className="back-link">← Back to posts</Link>
          <div className="ep-actions">
            <button type="button" className="btn-ghost" onClick={() => router.push("/admin")}>
              Cancel
            </button>
            <button className="btn-primary" disabled={busy || uploading}>
              {busy ? "Saving…" : mode === "create" ? "Publish" : "Save changes"}
            </button>
          </div>
        </div>

        {/* Cover — compact. A slim button until one is added. */}
        <div className="ep-cover">
          {hasCover ? (
            <div className="ep-cover-set">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="" className="ep-cover-img" />
              <div className="ep-cover-tools">
                <label>
                  {uploading ? "Uploading…" : "Change"}
                  <input type="file" accept="image/*" hidden onChange={handleCoverChange} disabled={uploading} />
                </label>
                <button type="button" onClick={() => setCover(DEFAULT_COVER)}>Remove</button>
              </div>
            </div>
          ) : (
            <label className="ep-cover-add">
              {uploading ? "Uploading…" : "＋ Add cover image"}
              <input type="file" accept="image/*" hidden onChange={handleCoverChange} disabled={uploading} />
            </label>
          )}
        </div>

        {/* Title */}
        <input
          className="ep-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          aria-label="Post title"
        />

        {/* Meta: category · summary, on one light line */}
        <div className="ep-meta">
          <input
            className="ep-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Add a category"
            aria-label="Category"
          />
          <span className="ep-sep">·</span>
          <input
            className="ep-summary"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="One-line summary shown on the homepage"
            aria-label="Summary"
          />
        </div>

        {/* Writing canvas */}
        <div className="ep-content">
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        {error && <p className="form-error ep-error">{error}</p>}
      </div>
    </form>
  );
}
