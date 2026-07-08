export function normalizeIdentifier(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}
