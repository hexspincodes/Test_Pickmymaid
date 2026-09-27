import { findMaids } from "@/lib/api";
import { mapMaidToProfile } from "@/lib/searchFilters";
import type { Profile } from "@/components/cards/ProfileCard";
import type { ApiMaid } from "@/types";

// /v2/maids/find has no "has video" filter and a fixed page size (9), so
// getting the video-enabled maids means walking pages until enough are
// found. Pages within a pass are fetched concurrently (not one at a time)
// since this runs on every homepage request with no caching — a sequential
// scan added several seconds to page load.
const PAGE_BATCH_SIZE = 6;
const MAX_PAGES_PER_PASS = 24;

function byDateDesc(a: ApiMaid, b: ApiMaid): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

async function collectVideoMaids(
  availability: "Not Hired" | "Hired",
  needed: number,
): Promise<ApiMaid[]> {
  const collected: ApiMaid[] = [];
  for (
    let batchStart = 1;
    batchStart <= MAX_PAGES_PER_PASS && collected.length < needed;
    batchStart += PAGE_BATCH_SIZE
  ) {
    const pages = Array.from(
      { length: Math.min(PAGE_BATCH_SIZE, MAX_PAGES_PER_PASS - batchStart + 1) },
      (_, i) => batchStart + i,
    );
    const results = await Promise.all(
      pages.map((page) => findMaids({ availability, page }).catch(() => null)),
    );

    let anyMaids = false;
    for (const res of results) {
      const maids = res?.data?.maids ?? [];
      if (maids.length > 0) anyMaids = true;
      for (const maid of maids) {
        if (maid.youtube_link?.trim()) collected.push(maid);
      }
    }
    if (!anyMaids) break;
  }
  return collected;
}

// Available (unhired) maids with a video, newest first; hired ones only
// fill the remainder if there aren't enough available candidates.
export async function getFeaturedVideoProfiles(cap = 20): Promise<Profile[]> {
  const available = (await collectVideoMaids("Not Hired", cap))
    .sort(byDateDesc)
    .slice(0, cap);

  let combined = available;
  if (combined.length < cap) {
    const hired = (await collectVideoMaids("Hired", cap - combined.length))
      .sort(byDateDesc)
      .slice(0, cap - combined.length);
    combined = [...combined, ...hired];
  }

  return combined.map((maid, i) => mapMaidToProfile(maid, i));
}
