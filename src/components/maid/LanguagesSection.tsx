import { Star } from "lucide-react";
import type { JobLanguage } from "@/types";

// API speak levels: 0 = Good, 1 = Excellent, 2 = Fair, 3 = Don't Know.
const SPEAK_RATING: Record<number, { stars: number; label: string }> = {
  0: { stars: 4, label: "Good" },
  1: { stars: 5, label: "Excellent" },
  2: { stars: 3, label: "Fair" },
  3: { stars: 1, label: "Don't Know" },
};

const MAX_STARS = 5;

function SpeakRating({ level }: { level: number | undefined }) {
  const rating = level === undefined ? undefined : SPEAK_RATING[level];
  if (!rating) return null;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Speaking: ${rating.label}, ${rating.stars} out of ${MAX_STARS} stars`}
      >
        {Array.from({ length: MAX_STARS }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating.stars ? "fill-primary text-primary" : "fill-gray-200 text-gray-200"
            }`}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-[#6f6f6f] tracking-[0.5px]">{rating.label}</span>
    </div>
  );
}

export function LanguagesSection({ languages }: { languages: JobLanguage[] }) {
  if (!languages || languages.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6">
      <h2 className="text-base font-semibold text-dark mb-5 flex items-center gap-2">
        Languages
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {languages.map((lang) => (
          <div
            key={lang._id || lang.id}
            className="flex flex-col rounded-xl border border-primary"
          >
            <span className="text-sm bg-primary-50 p-3 flex items-center justify-center font-bold text-dark rounded-[12px_12px_0_0]">
              {lang.name}
            </span>
            <div className="p-3">
              <SpeakRating level={lang.speak} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
