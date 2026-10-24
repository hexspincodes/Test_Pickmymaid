// Sent as `youtube_link` by the maid registration form, which no longer asks
// for one. It is a placeholder, not a maid's video, so the site ignores it.
export const DEFAULT_YOUTUBE_LINK = "https://www.youtube.com/@pickmymaid";

// The maid's own video link, or "" when there is none (or only the default).
export function maidVideoLink(link: string | undefined): string {
  const trimmed = link?.trim() ?? "";
  return trimmed === DEFAULT_YOUTUBE_LINK ? "" : trimmed;
}
