// ---------------------------------------------------------------------------
// app/layout.js  →  the shared shell around EVERY page
//
// Anything here (the top nav bar, the footer) shows up on all pages at once.
// The {children} slot is where each individual page gets dropped in.
// ---------------------------------------------------------------------------

import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";

// Two fonts — cool and highly readable:
//  - Inter         → the reading font: nav, body, tags, buttons (superb on screens)
//  - Space Grotesk → a distinctive geometric display face for headlines
// next/font exposes each family as its own CSS variable (the "-src" names).
// globals.css then aliases --font-sans / --font-display to these, with a
// plain fallback — done this way to avoid a self-referential var() cycle.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
});
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-src",
  display: "swap",
});

// This controls the text in the browser tab and helps search engines.
export const metadata = {
  title: "The Learning Blog",
  description: "A blog built while learning full-stack web development.",
};

// Runs before the page paints so the saved theme is applied with no flash.
// Defaults to dark mode when the visitor hasn't chosen one yet.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />

        {/* Top navigation bar — shown on every page */}
        <Nav />

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
