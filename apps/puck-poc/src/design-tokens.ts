export const SPACING_TOKENS = {
  "space.0": 0,
  "space.4": 4,
  "space.8": 8,
  "space.12": 12,
  "space.16": 16,
  "space.24": 24,
  "space.32": 32,
  "space.40": 40,
  "space.48": 48,
  "space.64": 64,
  "space.80": 80
} as const;

export type SpacingToken = keyof typeof SPACING_TOKENS;

export const RADIUS_TOKENS = {
  "radius.none": 0,
  "radius.sm": 6,
  "radius.md": 10,
  "radius.lg": 16,
  "radius.xl": 24,
  "radius.full": 9999
} as const;

export type RadiusToken = keyof typeof RADIUS_TOKENS;

export const SHADOW_TOKENS = {
  "shadow.none": "none",
  "shadow.sm": "0 6px 18px rgb(32 55 94 / 8%)",
  "shadow.md": "0 10px 24px rgb(32 55 94 / 12%)",
  "shadow.lg": "0 16px 36px rgb(32 55 94 / 16%)"
} as const;

export type ShadowToken = keyof typeof SHADOW_TOKENS;

export const TYPOGRAPHY_TOKENS = {
  display: { fontSize: "36px", fontWeight: 800, lineHeight: "1.1", letterSpacing: "-0.03em" },
  "heading-1": { fontSize: "30px", fontWeight: 800, lineHeight: "1.2", letterSpacing: "-0.02em" },
  "heading-2": { fontSize: "24px", fontWeight: 750, lineHeight: "1.25", letterSpacing: "-0.015em" },
  "heading-3": { fontSize: "20px", fontWeight: 750, lineHeight: "1.3", letterSpacing: "-0.01em" },
  title: { fontSize: "16px", fontWeight: 700, lineHeight: "1.35", letterSpacing: "0" },
  "body-large": { fontSize: "16px", fontWeight: 400, lineHeight: "1.6", letterSpacing: "0" },
  body: { fontSize: "14px", fontWeight: 400, lineHeight: "1.6", letterSpacing: "0" },
  "body-small": { fontSize: "12px", fontWeight: 400, lineHeight: "1.5", letterSpacing: "0" },
  caption: { fontSize: "11px", fontWeight: 650, lineHeight: "1.4", letterSpacing: "0.02em" }
} as const;

export type TypographyRole = keyof typeof TYPOGRAPHY_TOKENS;

export const SPACING_OPTIONS = Object.keys(SPACING_TOKENS).map((value) => ({
  label: value.replace("space.", "") + " px",
  value
}));

export const RADIUS_OPTIONS = Object.keys(RADIUS_TOKENS).map((value) => ({
  label: value.replace("radius.", "").replace("none", "None"),
  value
}));

export const SHADOW_OPTIONS = Object.keys(SHADOW_TOKENS).map((value) => ({
  label: value.replace("shadow.", "").replace("none", "None"),
  value
}));

export const TYPOGRAPHY_OPTIONS = Object.keys(TYPOGRAPHY_TOKENS).map((value) => ({
  label: value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  value
}));

function numericValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

export function resolveSpacing(value: unknown, fallback: number): number {
  if (typeof value === "string" && value in SPACING_TOKENS) return SPACING_TOKENS[value as SpacingToken];
  return numericValue(value) ?? fallback;
}

export function resolveRadius(value: unknown, fallback: number): number {
  if (typeof value === "string" && value in RADIUS_TOKENS) return RADIUS_TOKENS[value as RadiusToken];
  return numericValue(value) ?? fallback;
}

export function resolveShadow(value: unknown, fallback: ShadowToken): string {
  if (typeof value === "string" && value in SHADOW_TOKENS) return SHADOW_TOKENS[value as ShadowToken];
  if (value === "none" || value === "sm" || value === "md" || value === "lg") return SHADOW_TOKENS[`shadow.${value}` as ShadowToken];
  return SHADOW_TOKENS[fallback];
}

export function getTypographyStyle(value: unknown, fallback: TypographyRole = "body"): Record<string, string | number> {
  const role = typeof value === "string" && value in TYPOGRAPHY_TOKENS ? value as TypographyRole : fallback;
  return { ...TYPOGRAPHY_TOKENS[role] };
}

export function spacingTokenFor(value: number): SpacingToken | number {
  const match = Object.entries(SPACING_TOKENS).find(([, tokenValue]) => tokenValue === value);
  return match ? match[0] as SpacingToken : value;
}
