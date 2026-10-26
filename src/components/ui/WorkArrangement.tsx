import { House } from "lucide-react";
import { toList, type MultiValue } from "@/lib/multiValue";

// `option` is a list such as ["Live In", "Live Out"]; older profiles hold one
// string, e.g. "Live In And Live Out". Only the arrangements it contains are
// shown. Anything unrecognised is shown as-is.
const WORK_ARRANGEMENTS = [
  { label: "Live-in", matches: (o: string) => /live\s*-?\s*in\b/.test(o) },
  { label: "Live-out", matches: (o: string) => /live\s*-?\s*out\b/.test(o) },
  { label: "Part-time", matches: (o: string) => /part\s*-?\s*time/.test(o) },
];

function labelsFor(option: string): string[] {
  const normalized = option.toLowerCase();
  const matched = WORK_ARRANGEMENTS.filter(({ matches }) => matches(normalized)).map(
    ({ label }) => label,
  );
  return matched.length > 0 ? matched : [option];
}

export function workArrangementLabels(option: MultiValue | undefined): string[] {
  return [...new Set(toList(option).flatMap(labelsFor))];
}

// Same shell as the InfoRow pattern, with chips in place of the plain value.
export function WorkArrangementRow({
  option,
  iconClassName = "w-4 h-4",
}: {
  option: MultiValue | undefined;
  iconClassName?: string;
}) {
  const labels = workArrangementLabels(option);
  return (
    <div className="flex items-center justify-between gap-2 bg-[#f5f5f5] px-3 py-2 rounded-lg">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-dark/50">
          <House className={iconClassName} />
        </span>
        <span className="text-xs font-medium text-dark tracking-[0.5px]">
          Work Arrangement
        </span>
      </div>
      <div className="flex flex-wrap justify-end gap-1.5 min-w-0">
        {labels.length > 0 ? (
          labels.map((label) => (
            <span
              key={label}
              className="px-2.5 py-1 rounded-full bg-primary-50 text-primary text-xs font-semibold tracking-[0.5px] whitespace-nowrap"
            >
              {label}
            </span>
          ))
        ) : (
          <span className="text-xs font-medium text-dark/60 tracking-[0.5px]">
            Not specified
          </span>
        )}
      </div>
    </div>
  );
}
