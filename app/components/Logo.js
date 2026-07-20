// ---------------------------------------------------------------------------
// app/components/Logo.js  →  the brand mark used next to the site title.
// Uses the product app icon (public/appicon.png).
// ---------------------------------------------------------------------------
export default function Logo({ size = 28 }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/appicon.png"
      alt=""
      width={size}
      height={size}
      className="brand-logo"
    />
  );
}
