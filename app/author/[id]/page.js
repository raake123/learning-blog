// ---------------------------------------------------------------------------
// app/author/[id]/page.js  →  a public profile page for one author
//
// Shows the author's photo, name, and bio, followed by all of their posts.
// ---------------------------------------------------------------------------

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProfile, getPostsByAuthor } from "@/lib/posts";
import Byline from "../../components/Byline";

export const dynamic = "force-dynamic";

export default async function AuthorPage({ params }) {
  const { id } = await params;
  const [profile, posts] = await Promise.all([getProfile(id), getPostsByAuthor(id)]);

  // No profile row and no posts → this author doesn't exist.
  if (!profile && posts.length === 0) notFound();

  const name = profile?.name || posts[0]?.author || "Author";
  const avatar = profile?.avatar_url;

  return (
    <div className="container">
      <Link href="/" className="back-link">← All posts</Link>

      <header className="author-head">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="author-avatar" />
        ) : (
          <span className="author-avatar author-avatar-initial">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <h1 className="author-name">{name}</h1>
        {profile?.bio && <p className="author-bio">{profile.bio}</p>}
        <p className="author-count">
          {posts.length} post{posts.length === 1 ? "" : "s"}
        </p>
      </header>

      <section className="stories">
        {posts.map((post) => (
          <Link href={`/posts/${post.slug}`} className="story" key={post.slug}>
            <div className="story-body">
              {post.category && <span className="tag">{post.category}</span>}
              <h2 className="story-title">{post.title}</h2>
              <p className="story-excerpt">{post.excerpt}</p>
              <Byline
                author={post.author}
                date={post.date}
                content={post.content}
                authorAvatar={post.authorAvatar}
              />
            </div>
            {post.cover && (
              <div className="story-thumb">
                <Image src={post.cover} alt="" fill sizes="180px" />
              </div>
            )}
          </Link>
        ))}
      </section>
    </div>
  );
}
