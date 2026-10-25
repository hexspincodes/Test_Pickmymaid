// Sent as `youtube_link` by the maid registration form, which no longer asks
// for one. It is a placeholder, not a maid's video, so the site ignores it.
export const DEFAULT_YOUTUBE_LINK = "https://www.youtube.com/@pickmymaid";

// Whether a link points at a specific video (youtu.be/…, watch?v=…, /shorts/…,
// /embed/…, or a Vimeo player URL). Channel and home-page links can't play in
// an embedded player: YouTube refuses to be framed, leaving a blank box.
function isYouTubeVideo(url: string): boolean {
  return /youtu\.be\/[\w-]+|[?&](amp;)?v=[\w-]+|\/(shorts|embed|live)\/[\w-]+|player\.vimeo\.com\/video\/\d+/.test(url);
}

// The maid's own video link, or "" when there is none — no link, only the
// registration default, or a link that isn't a playable video.
export function maidVideoLink(link: string | undefined): string {
  const trimmed = link?.trim() ?? "";
  if (trimmed === DEFAULT_YOUTUBE_LINK) return "";
  return isYouTubeVideo(trimmed) ? trimmed : "";
}
