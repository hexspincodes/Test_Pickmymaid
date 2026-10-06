// Uploaded images (maid photos, blog thumbnails, …) live in the DigitalOcean
// Spaces bucket `pickmymaidbucket` (sfo3). The API stores bucket keys like
// `images/2026-09-29/<file>.webp`; prefix them with this base to render.
export const ASSET_BASE =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ??
  "https://pickmymaidbucket.sfo3.cdn.digitaloceanspaces.com";
