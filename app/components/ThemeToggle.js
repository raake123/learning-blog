// ---------------------------------------------------------------------------
// app/components/ThemeToggle.js  →  the light/dark switch in the nav bar
//
// A "use client" component because it reacts to clicks and reads localStorage.
// The actual theme is set super early by a tiny script in layout.js (so there's
// no flash on load); this button just flips it and remembers the choice.
// ---------------------------------------------------------------------------
"use client";

import { useEffect, useState } from "react";

const SunIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  // After mount, read whatever the early script already set on <html>.
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "dark");
  }, []);

  function toggle() {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={theme === "light" ? "Switch to dark" : "Switch to light"}
    >
      {/* Show a sun while dark (tap for light), a moon while light. */}
      {theme === "light" ? MoonIcon : SunIcon}
    </button>
  );
}
