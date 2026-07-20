// ---------------------------------------------------------------------------
// app/components/Logo.js  →  the minimal brand mark
//
// A rounded tile with three text lines — an article/paragraph, the universal
// shorthand for writing & content. Uses the brand accent so it adapts to theme.
// ---------------------------------------------------------------------------
export default function Logo({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className="brand-logo"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <g fill="#fff">
        <rect x="8" y="9" width="16" height="2.6" rx="1.3" />
        <rect x="8" y="14.7" width="16" height="2.6" rx="1.3" />
        <rect x="8" y="20.4" width="9" height="2.6" rx="1.3" />
      </g>
    </svg>
  );
}
