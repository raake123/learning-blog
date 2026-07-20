// ---------------------------------------------------------------------------
// app/admin/BlockEditor.js  →  a Notion-style "add a section" post editor
//
// A post is built from BLOCKS (sections) you add as needed. Each block has a
// type (heading, text, quote, list, code, image, divider) and its content.
// Controls per block: move up / down / delete. A bar at the bottom adds more.
//
// Blocks are stored as JSON in the post's `blocks` column. The reader page
// (app/posts/[slug]/page.js) turns them back into a nicely formatted article.
// ---------------------------------------------------------------------------
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// The "already defined sections" a writer can add.
const SECTIONS = [
  { type: "heading", label: "Heading", hint: "A big section title" },
  { type: "subheading", label: "Subheading", hint: "A smaller title" },
  { type: "paragraph", label: "Text", hint: "A paragraph" },
  { type: "quote", label: "Quote", hint: "A highlighted quote" },
  { type: "list", label: "List", hint: "One item per line" },
  { type: "code", label: "Code", hint: "A monospace block" },
  { type: "image", label: "Image", hint: "Upload a picture" },
  { type: "divider", label: "Divider", hint: "A separating line" },
];

let seq = 0;
const uid = () => `b${Date.now()}_${seq++}`;
const labelFor = (type) =>
  (SECTIONS.find((s) => s.type === type) || { label: type }).label;

function makeBlock(type) {
  const base = { id: uid(), type };
  if (type === "image") return { ...base, url: "" };
  if (type === "divider") return base;
  return { ...base, text: "" };
}

// Turn whatever we loaded (or nothing) into a valid block array with ids.
export function normalizeBlocks(initial) {
  if (Array.isArray(initial) && initial.length) {
    return initial.map((b) => ({ id: b.id || uid(), ...b }));
  }
  return [makeBlock("paragraph")];
}

// A plain-text version of the post — used for the excerpt fallback, reading
// time, and to satisfy the older `content` column (which can't be empty).
export function blocksToPlainText(blocks) {
  return blocks
    .map((b) => (b.type === "divider" || b.type === "image" ? "" : b.text || ""))
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

export default function BlockEditor({ blocks, onChange }) {
  const [error, setError] = useState(null);

  const update = (id, patch) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const add = (type) => onChange([...blocks, makeBlock(type)]);
  const remove = (id) => onChange(blocks.filter((b) => b.id !== id));
  function move(id, dir) {
    const i = blocks.findIndex((b) => b.id === id);
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  async function uploadImage(id, file) {
    if (!file) return;
    setError(null);
    const ext = file.name.split(".").pop();
    const path = `block-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("covers").upload(path, file);
    if (up.error) {
      setError(up.error.message);
      return;
    }
    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    update(id, { url: data.publicUrl });
  }

  function renderEditor(b) {
    switch (b.type) {
      case "heading":
        return (
          <input
            className="blk-input blk-heading"
            value={b.text}
            onChange={(e) => update(b.id, { text: e.target.value })}
            placeholder="Section heading"
          />
        );
      case "subheading":
        return (
          <input
            className="blk-input blk-subheading"
            value={b.text}
            onChange={(e) => update(b.id, { text: e.target.value })}
            placeholder="Subheading"
          />
        );
      case "paragraph":
        return (
          <textarea
            className="blk-input"
            rows={4}
            value={b.text}
            onChange={(e) => update(b.id, { text: e.target.value })}
            placeholder="Write here. Leave a blank line between paragraphs."
          />
        );
      case "quote":
        return (
          <textarea
            className="blk-input blk-quote"
            rows={2}
            value={b.text}
            onChange={(e) => update(b.id, { text: e.target.value })}
            placeholder="A quote to highlight."
          />
        );
      case "list":
        return (
          <textarea
            className="blk-input"
            rows={4}
            value={b.text}
            onChange={(e) => update(b.id, { text: e.target.value })}
            placeholder="One item per line"
          />
        );
      case "code":
        return (
          <textarea
            className="blk-input blk-code"
            rows={5}
            spellCheck={false}
            value={b.text}
            onChange={(e) => update(b.id, { text: e.target.value })}
            placeholder="Code…"
          />
        );
      case "image":
        return (
          <div className="blk-image">
            {b.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.url} alt="" className="blk-image-preview" />
            ) : (
              <div className="blk-image-empty">No image yet</div>
            )}
            <label className="btn-ghost cover-upload-btn">
              {b.url ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => uploadImage(b.id, e.target.files[0])}
              />
            </label>
          </div>
        );
      case "divider":
        return <div className="blk-divider-preview">— divider —</div>;
      default:
        return null;
    }
  }

  return (
    <div className="blocks">
      {blocks.map((b, i) => (
        <div className="block" key={b.id}>
          <div className="block-head">
            <span className="block-type">{labelFor(b.type)}</span>
            <div className="block-tools">
              <button type="button" onClick={() => move(b.id, -1)} disabled={i === 0} aria-label="Move section up">↑</button>
              <button type="button" onClick={() => move(b.id, 1)} disabled={i === blocks.length - 1} aria-label="Move section down">↓</button>
              <button type="button" className="block-del" onClick={() => remove(b.id)} aria-label="Delete section">✕</button>
            </div>
          </div>
          <div className="block-body">{renderEditor(b)}</div>
        </div>
      ))}

      {error && <p className="form-error">{error}</p>}

      <div className="block-add">
        <span className="block-add-label">Add a section</span>
        <div className="block-add-btns">
          {SECTIONS.map((s) => (
            <button
              type="button"
              key={s.type}
              className="block-add-btn"
              onClick={() => add(s.type)}
              title={s.hint}
            >
              + {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
