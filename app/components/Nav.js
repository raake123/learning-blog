// ---------------------------------------------------------------------------
// app/components/Nav.js  →  the top navigation bar
//
// A client component so it can hide the "Write" button when you're already in
// the admin/write area (where it would be redundant).
// ---------------------------------------------------------------------------
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  const pathname = usePathname() || "";
  const inAdmin = pathname.startsWith("/admin");

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="site-name">
          The&nbsp;Learning&nbsp;Blog
        </Link>
        <div className="nav-right">
          <ThemeToggle />
          {!inAdmin && (
            <Link href="/admin" className="nav-write">
              Write
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
