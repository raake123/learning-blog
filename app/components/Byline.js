// ---------------------------------------------------------------------------
// app/components/Byline.js  →  avatar + author + date + read time
//
// Shows the author's profile photo when we have one (falling back to their
// initial), and links to the author's profile page when a userId is given.
// ---------------------------------------------------------------------------

import Link from "next/link";
import { formatDate, readingTime } from "@/lib/posts";

export default function Byline({ author, date, content, size = "small", authorAvatar, userId }) {
  const initial = author.charAt(0).toUpperCase();

  const avatar = authorAvatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={authorAvatar} alt="" className="avatar avatar-photo" />
  ) : (
    <span className="avatar" aria-hidden="true">{initial}</span>
  );

  const inner = (
    <>
      {avatar}
      <span className="byline-text">
        <span className="byline-author">{author}</span>
        <span className="byline-meta">
          {formatDate(date)} · {readingTime(content)}
        </span>
      </span>
    </>
  );

  const className = `byline byline-${size}`;

  if (userId) {
    return (
      <Link href={`/author/${userId}`} className={`${className} byline-link`}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}
