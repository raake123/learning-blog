// ---------------------------------------------------------------------------
// app/components/Byline.js  →  a small reusable piece of UI
//
// A "component" is just a function that returns some HTML you can reuse.
// This one shows: [avatar]  Author Name · Jul 19, 2026 · 2 min read
// We use it on both the homepage and the article page — write once, use twice.
// ---------------------------------------------------------------------------

import { formatDate, readingTime } from "@/lib/posts";

export default function Byline({ author, date, content, size = "small" }) {
  // The avatar is just the author's first initial in a colored circle.
  const initial = author.charAt(0).toUpperCase();

  return (
    <div className={`byline byline-${size}`}>
      <span className="avatar" aria-hidden="true">
        {initial}
      </span>
      <span className="byline-text">
        <span className="byline-author">{author}</span>
        <span className="byline-meta">
          {formatDate(date)} · {readingTime(content)}
        </span>
      </span>
    </div>
  );
}
