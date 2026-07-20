// ---------------------------------------------------------------------------
// app/posts/[slug]/page.js  →  one full blog post
//
// The folder is named [slug] with square brackets. That makes it a "dynamic"
// route: the same file handles /posts/hello-world, /posts/how-the-web-works,
// and any other post. Whatever is in the URL arrives as `params.slug`.
// ---------------------------------------------------------------------------

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import Byline from "../../components/Byline";

// Turn one saved section (block) into its article HTML.
function renderBlock(b, i) {
  switch (b.type) {
    case "heading":
      return <h2 className="post-h2" key={i}>{b.text}</h2>;
    case "subheading":
      return <h3 className="post-h3" key={i}>{b.text}</h3>;
    case "paragraph":
      return b.text
        .split("\n\n")
        .filter(Boolean)
        .map((t, j) => <p key={`${i}-${j}`}>{t}</p>);
    case "quote":
      return <blockquote className="post-quote" key={i}>{b.text}</blockquote>;
    case "list":
      return (
        <ul className="post-ul" key={i}>
          {b.text
            .split("\n")
            .filter((l) => l.trim())
            .map((li, j) => (
              <li key={j}>{li.replace(/^[-*•]\s*/, "")}</li>
            ))}
        </ul>
      );
    case "code":
      return (
        <pre className="post-code" key={i}>
          <code>{b.text}</code>
        </pre>
      );
    case "image":
      return b.url ? (
        <figure className="post-figure" key={i}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.url} alt="" />
        </figure>
      ) : null;
    case "divider":
      return <hr className="post-hr" key={i} />;
    default:
      return null;
  }
}

// Always fetch the latest version of the post from the database.
export const dynamic = "force-dynamic";

// Note the `async` and `await params` — in Next.js 16 the URL params arrive as
// a Promise, so we wait for them before using the slug inside.
export default async function PostPage({ params }) {
  const { slug } = await params;
  // getPostBySlug now talks to the database, so it's async — we must await it.
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="article">
      <div className="container">
        <Link href="/" className="back-link">
          ← All posts
        </Link>

        {/* Article header: category, title, byline */}
        <span className="tag">{post.category}</span>
        <h1 className="article-title">{post.title}</h1>
        <Byline
          author={post.author}
          date={post.date}
          content={post.content}
          size="large"
        />
      </div>

      {/* Full-width cover image */}
      <div className="article-cover">
        <Image
          src={post.cover}
          alt=""
          fill
          sizes="(max-width: 1000px) 100vw, 1000px"
          priority
        />
      </div>

      {/* The body text, in comfortable serif paragraphs */}
      <div className="container">
        {post.blocks && post.blocks.length ? (
          <div className="post-body">
            {post.blocks.map((b, i) => renderBlock(b, i))}
          </div>
        ) : (
          <div className="article-body">
            {post.content.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}

        <Link href="/" className="back-link">
          ← All posts
        </Link>
      </div>
    </article>
  );
}
