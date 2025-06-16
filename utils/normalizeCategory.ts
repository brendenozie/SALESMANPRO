// utils/normalizeCategory.ts
export function normalizeCategory(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, '')
    .replace(/\s+/g, ' ');
}
