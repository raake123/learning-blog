/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Our built-in gradient covers are SVG files we made ourselves. Next.js
    // blocks SVGs through its image optimizer by default; because these are our
    // own trusted files, we allow them, with a strict policy so they can't run code.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Uploaded cover images live in Supabase Storage. Next.js only shows images
    // from websites we explicitly trust — so we allow our own storage domain.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bzceyhohyehvltehbsda.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
