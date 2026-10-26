// A maid's `location` and `option` are lists (the admin panel picks several);
// profiles saved before that hold a single string.
export type MultiValue = string | string[];

export function toList(value: MultiValue | null | undefined): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((v) => v.trim()).filter(Boolean);
}
