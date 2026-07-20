// ---------------------------------------------------------------------------
// app/page.js  →  the homepage, shown at "/"
//
// Layout: the newest post is shown large as a "featured" hero, and the rest
// appear below as a clean list with small thumbnails — the Medium look.
// ---------------------------------------------------------------------------

import Link from "next/link";
import Image from "next/image"; // Next.js's smart image component (auto-optimized)
import { getAllPosts } from "@/lib/posts";
import Byline from "./components/Byline";

// Always fetch the latest posts from the database (so new posts show up
// immediately, instead of a cached snapshot).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getAllPosts();

  // If there are no posts yet (empty database), show a friendly message.
  if (posts.length === 0) {
    return (
      <div className="container">
        <header className="masthead">
          <h1>The Learning Blog</h1>
          <p>No posts yet — check back soon.</p>
        </header>
      </div>
    );
  }

  // Split the list: the first (newest) post is featured, the rest go in the list.
  const [featured, ...rest] = posts;

  return (
    <div className="container">
      {/* Masthead */}
      <header className="masthead">
        <span className="masthead-kicker">Essays · Notes · Tutorials</span>
        <h1>The Learning Blog</h1>
        <p>Notes from someone figuring out how to build things on the web.</p>
      </header>

      {/* Featured hero post */}
      <Link href={`/posts/${featured.slug}`} className="feature">
        <div className="feature-image">
          <Image
            src={featured.cover}
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 680px"
            priority
          />
        </div>
        <div className="feature-body">
          <span className="tag">{featured.category}</span>
          <h2 className="feature-title">{featured.title}</h2>
          <p className="feature-excerpt">{featured.excerpt}</p>
          <Byline
            author={featured.author}
            date={featured.date}
            content={featured.content}
          />
        </div>
      </Link>

      {/* The rest of the posts as list rows */}
      <section className="stories">
        <h3 className="stories-heading">More stories</h3>
        {rest.map((post) => (
          <Link
            href={`/posts/${post.slug}`}
            className="story"
            key={post.slug}
          >
            <div className="story-body">
              <span className="tag">{post.category}</span>
              <h2 className="story-title">{post.title}</h2>
              <p className="story-excerpt">{post.excerpt}</p>
              <Byline
                author={post.author}
                date={post.date}
                content={post.content}
              />
            </div>
            <div className="story-thumb">
              <Image
                src={post.cover}
                alt=""
                fill
                sizes="160px"
              />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
