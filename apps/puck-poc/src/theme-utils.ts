export const THEME_COLOR_NAMES = [
  "primary",
  "secondary",
  "background",
  "surface",
  "text",
  "muted",
  "border",
  "success",
  "warning",
  "danger"
] as const;

export type ThemeColorName = typeof THEME_COLOR_NAMES[number];
export type ThemeId = "clean-light" | "clean-dark";
export type StyleId = "clean" | "soft" | "business" | "compact" | "glass";
export type BuiltInPresetId = "clean-light" | "clean-dark" | "compact-dashboard";

export type ThemePalette = Record<ThemeColorName, string>;

export type StylePreset = {
  label: string;
  radius: { sm: number; md: number; lg: number };
  shadowCard: string;
  density: number;
  surfaceAlpha: number;
  fontFamily: string;
};

export const THEME_PALETTES: Record<ThemeId, ThemePalette> = {
  "clean-light": {
    primary: "#315efb",
    secondary: "#e8edff",
    background: "#f4f6fa",
    surface: "#ffffff",
    text: "#172033",
    muted: "#526079",
    border: "#d8deea",
    success: "#176b45",
    warning: "#8a5a0a",
    danger: "#9a3f3f"
  },
  "clean-dark": {
    primary: "#8aa4ff",
    secondary: "#2b365b",
    background: "#101827",
    surface: "#1a2536",
    text: "#f4f7ff",
    muted: "#a8b3c7",
    border: "#34445e",
    success: "#5ee39a",
    warning: "#f5c451",
    danger: "#ff8b9c"
  }
};

export const STYLE_PRESETS: Record<StyleId, StylePreset> = {
  clean: {
    label: "Clean",
    radius: { sm: 6, md: 10, lg: 16 },
    shadowCard: "0 6px 18px rgb(32 55 94 / 8%)",
    density: 1,
    surfaceAlpha: 1,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  },
  soft: {
    label: "Soft",
    radius: { sm: 8, md: 14, lg: 22 },
    shadowCard: "0 14px 32px rgb(32 55 94 / 12%)",
    density: 1.08,
    surfaceAlpha: 1,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  },
  business: {
    label: "Business",
    radius: { sm: 4, md: 8, lg: 10 },
    shadowCard: "0 3px 10px rgb(32 55 94 / 7%)",
    density: 0.96,
    surfaceAlpha: 1,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  },
  compact: {
    label: "Compact",
    radius: { sm: 4, md: 7, lg: 9 },
    shadowCard: "0 2px 8px rgb(32 55 94 / 8%)",
    density: 0.82,
    surfaceAlpha: 1,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  },
  glass: {
    label: "Glass",
    radius: { sm: 8, md: 16, lg: 24 },
    shadowCard: "0 18px 42px rgb(32 55 94 / 16%)",
    density: 1.04,
    surfaceAlpha: 0.72,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  }
};

export const THEME_OPTIONS = [
  { label: "Clean Light", value: "clean-light" },
  { label: "Clean Dark", value: "clean-dark" }
];

export const STYLE_OPTIONS = Object.entries(STYLE_PRESETS).map(([value, preset]) => ({
  label: preset.label,
  value
}));

export const BUILT_IN_PRESETS: Record<BuiltInPresetId, { label: string; theme: ThemeId; style: StyleId }> = {
  "clean-light": { label: "Clean Light", theme: "clean-light", style: "clean" },
  "clean-dark": { label: "Clean Dark", theme: "clean-dark", style: "clean" },
  "compact-dashboard": { label: "Compact Dashboard", theme: "clean-light", style: "compact" }
};

export const BUILT_IN_PRESET_OPTIONS = [
  { label: "Choose preset…", value: "" },
  ...Object.entries(BUILT_IN_PRESETS).map(([value, preset]) => ({ label: preset.label, value }))
];

export function normalizeTheme(value: unknown): ThemeId {
  return value === "clean-dark" ? "clean-dark" : "clean-light";
}

export function normalizeStyle(value: unknown): StyleId {
  return value === "soft" || value === "business" || value === "compact" || value === "glass" ? value : "clean";
}

export function getThemeStyleVars(themeValue: unknown, styleValue: unknown): Record<string, string | number> {
  const theme = THEME_PALETTES[normalizeTheme(themeValue)];
  const style = STYLE_PRESETS[normalizeStyle(styleValue)];
  return {
    ...Object.fromEntries(THEME_COLOR_NAMES.map((name) => [`--poc-color-${name}`, theme[name]])),
    "--poc-color-on-primary": normalizeTheme(themeValue) === "clean-dark" ? "#101827" : "#ffffff",
    "--poc-radius-sm": `${style.radius.sm}px`,
    "--poc-radius-md": `${style.radius.md}px`,
    "--poc-radius-lg": `${style.radius.lg}px`,
    "--poc-radius-none": "0px",
    "--poc-radius-full": "9999px",
    "--poc-shadow-none": "none",
    "--poc-shadow-sm": style.shadowCard,
    "--poc-shadow-md": style.shadowCard.replace(/8%|12%|16%/g, "14%"),
    "--poc-shadow-lg": style.shadowCard.replace(/8%|12%|16%/g, "18%"),
    "--poc-shadow-card": style.shadowCard,
    "--poc-density": style.density,
    "--poc-surface-alpha": style.surfaceAlpha,
    "--poc-font-family": style.fontFamily
  };
}

export function resolveThemeColor(value: unknown, fallback: ThemeColorName = "surface"): string {
  if (typeof value === "string" && value.startsWith("theme.")) {
    const name = value.slice("theme.".length);
    if ((THEME_COLOR_NAMES as readonly string[]).includes(name)) return `var(--poc-color-${name})`;
  }
  if (typeof value === "string" && value.length > 0) return value;
  return `var(--poc-color-${fallback})`;
}
