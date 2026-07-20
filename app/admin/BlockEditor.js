// ---------------------------------------------------------------------------
// app/admin/BlockEditor.js  →  a Notion-style writing canvas
//
// You type directly on the page. Each block already looks like its finished
// form (a heading looks like a heading). Hover a block to reveal, in the left
// margin, a ＋ (insert a section) and a ⋮⋮ drag handle (reorder). Text areas
// grow as you type. Blocks are stored as JSON in the post's `blocks` column.
// ---------------------------------------------------------------------------
"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { supabase } from "@/lib/supabase";

const SECTIONS = [
  { type: "paragraph", label: "Text", mark: "¶" },
  { type: "heading", label: "Heading", mark: "H1" },
  { type: "subheading", label: "Subheading", mark: "H2" },
  { type: "quote", label: "Quote", mark: "❝" },
  { type: "list", label: "Bulleted list", mark: "•" },
  { type: "code", label: "Code", mark: "</>" },
  { type: "image", label: "Image", mark: "▦" },
  { type: "divider", label: "Divider", mark: "—" },
];

let seq = 0;
const uid = () => `b${Date.now()}_${seq++}`;

function makeBlock(type) {
  const base = { id: uid(), type };
  if (type === "image") return { ...base, url: "" };
  if (type === "divider") return base;
  return { ...base, text: "" };
}

export function normalizeBlocks(initial) {
  if (Array.isArray(initial) && initial.length)
    return initial.map((b) => ({ id: b.id || uid(), ...b }));
  return [makeBlock("paragraph")];
}

export function blocksToPlainText(blocks) {
  return blocks
    .map((b) => (b.type === "divider" || b.type === "image" ? "" : b.text || ""))
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

// A textarea that grows with its content — no scrollbar, no resize handle.
function Grow({ inputRef, value, className, ...rest }) {
  const ref = useRef(null);
  const set = (el) => {
    ref.current = el;
    if (inputRef) inputRef(el);
  };
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [value]);
  return <textarea ref={set} rows={1} value={value} className={className} {...rest} />;
}

export default function BlockEditor({ blocks, onChange }) {
  const [error, setError] = useState(null);
  const [menuFor, setMenuFor] = useState(null); // block id | "end" | null
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);
  const focusRefs = useRef({});

  useEffect(() => {
    if (focusTarget && focusRefs.current[focusTarget]) {
      focusRefs.current[focusTarget].focus();
      setFocusTarget(null);
    }
  }, [focusTarget, blocks]);

  const regFocus = (key) => (el) => {
    if (el) focusRefs.current[key] = el;
    else delete focusRefs.current[key];
  };

  const setText = (id, text) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, text } : b)));
  const setUrl = (id, url) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, url } : b)));
  const removeBlock = (id) =>
    onChange(blocks.length > 1 ? blocks.filter((b) => b.id !== id) : blocks);

  function insertAfter(id, type) {
    const nb = makeBlock(type);
    if (id === "end") onChange([...blocks, nb]);
    else {
      const i = blocks.findIndex((b) => b.id === id);
      const next = [...blocks];
      next.splice(i + 1, 0, nb);
      onChange(next);
    }
    setMenuFor(null);
    if (type !== "divider" && type !== "image") setFocusTarget(`${nb.id}#0`);
  }

  function moveTo(targetId) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const from = blocks.findIndex((b) => b.id === dragId);
    const arr = [...blocks];
    const [moved] = arr.splice(from, 1);
    const to = arr.findIndex((b) => b.id === targetId);
    arr.splice(to, 0, moved);
    onChange(arr);
    setDragId(null);
    setOverId(null);
  }

  async function uploadImage(id, file) {
    if (!file) return;
    setError(null);
    const ext = file.name.split(".").pop();
    const path = `block-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("covers").upload(path, file);
    if (up.error) return setError(up.error.message);
    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    setUrl(id, data.publicUrl);
  }

  function InsertMenu({ id }) {
    return (
      <div className="ed-menu" role="menu">
        {SECTIONS.map((s) => (
          <button type="button" key={s.type} onClick={() => insertAfter(id, s.type)}>
            <span className="mk">{s.mark}</span> {s.label}
          </button>
        ))}
      </div>
    );
  }

  function content(b, first) {
    switch (b.type) {
      case "heading":
        return (
          <Grow inputRef={regFocus(`${b.id}#0`)} className="ed-input ed-heading"
            value={b.text} placeholder="Heading"
            onChange={(e) => setText(b.id, e.target.value)} />
        );
      case "subheading":
        return (
          <Grow inputRef={regFocus(`${b.id}#0`)} className="ed-input ed-subheading"
            value={b.text} placeholder="Subheading"
            onChange={(e) => setText(b.id, e.target.value)} />
        );
      case "quote":
        return (
          <Grow inputRef={regFocus(`${b.id}#0`)} className="ed-input ed-quote"
            value={b.text} placeholder="Quote"
            onChange={(e) => setText(b.id, e.target.value)} />
        );
      case "code":
        return (
          <Grow inputRef={regFocus(`${b.id}#0`)} className="ed-input ed-code"
            value={b.text} placeholder="Code" spellCheck={false}
            onChange={(e) => setText(b.id, e.target.value)} />
        );
      case "list": {
        const items = (b.text || "").split("\n");
        if (items.length === 0) items.push("");
        const commit = (arr) => setText(b.id, arr.join("\n"));
        return (
          <ul className="ed-list">
            {items.map((it, idx) => (
              <li className="ed-li" key={idx}>
                <span className="ed-dot">•</span>
                <Grow
                  inputRef={regFocus(`${b.id}#${idx}`)}
                  className="ed-input ed-listitem"
                  value={it}
                  placeholder="List item"
                  onChange={(e) => {
                    const arr = [...items];
                    arr[idx] = e.target.value;
                    commit(arr);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const arr = [...items];
                      arr.splice(idx + 1, 0, "");
                      commit(arr);
                      setFocusTarget(`${b.id}#${idx + 1}`);
                    } else if (e.key === "Backspace" && it === "" && items.length > 1) {
                      e.preventDefault();
                      const arr = [...items];
                      arr.splice(idx, 1);
                      commit(arr);
                      setFocusTarget(`${b.id}#${Math.max(0, idx - 1)}`);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        );
      }
      case "image":
        return (
          <div className="ed-image">
            {b.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.url} alt="" className="ed-image-preview" />
            ) : (
              <label className="ed-image-drop">
                <span>Click to upload an image</span>
                <input type="file" accept="image/*" hidden
                  onChange={(e) => uploadImage(b.id, e.target.files[0])} />
              </label>
            )}
            {b.url && (
              <label className="ed-replace">
                Replace
                <input type="file" accept="image/*" hidden
                  onChange={(e) => uploadImage(b.id, e.target.files[0])} />
              </label>
            )}
          </div>
        );
      case "divider":
        return <hr className="ed-divider" />;
      default:
        return (
          <Grow inputRef={regFocus(`${b.id}#0`)} className="ed-input ed-paragraph"
            value={b.text}
            placeholder={first ? "Tell your story…" : "Write, or press ＋ to add a section"}
            onChange={(e) => setText(b.id, e.target.value)} />
        );
    }
  }

  return (
    <div className="editor">
      {blocks.map((b, i) => (
        <div
          key={b.id}
          className={`ed-block${overId === b.id && dragId && dragId !== b.id ? " drop-before" : ""}`}
          onDragOver={(e) => {
            if (dragId) {
              e.preventDefault();
              if (overId !== b.id) setOverId(b.id);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            moveTo(b.id);
          }}
        >
          <div className="ed-gutter">
            <button type="button" className="ed-tool" title="Add a section"
              onClick={() => setMenuFor(menuFor === b.id ? null : b.id)}>＋</button>
            <button type="button" className="ed-tool ed-drag" title="Drag to reorder" draggable
              onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragId(b.id); }}
              onDragEnd={() => { setDragId(null); setOverId(null); }}>
              <svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true"><g fill="currentColor"><circle cx="2.5" cy="3" r="1.3"/><circle cx="7.5" cy="3" r="1.3"/><circle cx="2.5" cy="8" r="1.3"/><circle cx="7.5" cy="8" r="1.3"/><circle cx="2.5" cy="13" r="1.3"/><circle cx="7.5" cy="13" r="1.3"/></g></svg>
            </button>
            {menuFor === b.id && <InsertMenu id={b.id} />}
          </div>

          <div className="ed-content">{content(b, i === 0)}</div>

          <button type="button" className="ed-remove" title="Delete section"
            onClick={() => removeBlock(b.id)} aria-label="Delete section">✕</button>
        </div>
      ))}

      {error && <p className="form-error">{error}</p>}

      <div className="ed-foot">
        <button type="button" className="ed-add"
          onClick={() => setMenuFor(menuFor === "end" ? null : "end")}>＋ Add a section</button>
        {menuFor === "end" && <InsertMenu id="end" />}
      </div>
    </div>
  );
}
