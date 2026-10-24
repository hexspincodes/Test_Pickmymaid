// Turns what a visitor types ("childcare", "chikd care", "nanny") into the
// skill names maids register with ("Child Care"), so keyword searches return
// skill-based profiles instead of relying on exact text.

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

// Everyday words that mean a skill without sharing its spelling.
const SYNONYMS: Record<string, string[]> = {
  nanny: ["Child Care", "Newborn Care"],
  babysitter: ["Child Care"],
  babysitting: ["Child Care"],
  baby: ["Newborn Care", "Child Care"],
  babies: ["Newborn Care", "Child Care"],
  infant: ["Newborn Care"],
  kid: ["Child Care"],
  kids: ["Child Care"],
  children: ["Child Care"],
  elder: ["Elderly Care"],
  elders: ["Elderly Care"],
  senior: ["Elderly Care"],
  chef: ["Cooking"],
  gardener: ["Gardening"],
  housemaid: ["Cleaning/Housekeeping"],
  cleaner: ["Cleaning/Housekeeping"],
};

function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

// Typos allowed for a word of this length: none for short words, where a
// single changed letter usually means a different word.
const tolerance = (length: number) => (length <= 3 ? 0 : length <= 5 ? 1 : 2);

// Does the typed word match the start of the skill word, allowing typos?
// "cook" → "cooking", "chikd" → "child", "housekeeper" → "housekeeping".
function wordMatches(typed: string, skillWord: string): boolean {
  if (skillWord.startsWith(typed)) return true;
  if (typed.length < 4 || skillWord.length < typed.length) return false;
  return editDistance(typed, skillWord.slice(0, typed.length)) <= tolerance(typed.length);
}

export function matchSkills(query: string, skills: string[]): string[] {
  const whole = normalize(query);
  if (!whole) return [];

  // The whole phrase, ignoring spaces: "childcare", "Child care", "chikdcare".
  const exact = skills.filter((s) => normalize(s) === whole);
  if (exact.length) return exact;
  if (whole.length >= 4) {
    const close = skills.filter(
      (s) => editDistance(normalize(s), whole) <= tolerance(whole.length),
    );
    if (close.length) return close;
  }

  // Otherwise word by word, keeping the skills that match the most words,
  // so "baby care" picks Newborn/Child Care rather than every "care" skill.
  const scores = new Map<string, number>();
  for (const typed of words(query)) {
    if (typed.length < 3) continue;
    const synonyms = SYNONYMS[typed] ?? [];
    for (const skill of skills) {
      if (synonyms.includes(skill) || words(skill).some((w) => wordMatches(typed, w))) {
        scores.set(skill, (scores.get(skill) ?? 0) + 1);
      }
    }
  }
  const best = Math.max(0, ...scores.values());
  return best ? skills.filter((s) => scores.get(s) === best) : [];
}
