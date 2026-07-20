// ---------------------------------------------------------------------------
// app/components/Logo.js  →  the brand mark next to the site title.
// The product icon with its tile removed (transparent); a light-recoloured
// variant is shown in dark mode so the mark stays visible.
// ---------------------------------------------------------------------------
export default function Logo({ size = 34 }) {
  return (
    <span className="brand-logo" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/appicon.png" alt="" className="brand-logo-img brand-logo-light" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/appicon-dark.png" alt="" className="brand-logo-img brand-logo-dark" />
    </span>
  );
}
