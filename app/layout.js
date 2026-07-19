// ---------------------------------------------------------------------------
// app/layout.js  →  the shared shell around EVERY page
//
// Anything here (the top nav bar, the footer) shows up on all pages at once.
// The {children} slot is where each individual page gets dropped in.
// ---------------------------------------------------------------------------

import Link from "next/link";
import { Geist, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Two fonts, like a real magazine:
//  - a clean sans-serif for the interface (nav, dates, buttons)
//  - an elegant serif for headlines and article text
const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

// This controls the text in the browser tab and helps search engines.
export const metadata = {
  title: "The Learning Blog",
  description: "A blog built while learning full-stack web development.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        {/* Top navigation bar — shown on every page */}
        <nav className="site-nav">
          <div className="site-nav-inner">
            <Link href="/" className="site-name">
              The&nbsp;Learning&nbsp;Blog
            </Link>
            <Link href="/admin" className="nav-write">
              Write
            </Link>
          </div>
        </nav>

        {/* Each page's own content appears here */}
        <main>{children}</main>

        {/* Footer — shown on every page */}
        <footer className="site-footer">
          <p>Built while learning · {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
