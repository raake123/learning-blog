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
        <div className="article-body">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <Link href="/" className="back-link">
          ← All posts
        </Link>
      </div>
    </article>
  );
}
