export type AppearanceShadow = "none" | "sm" | "md" | "lg";

type AppearanceOptions = {
  background?: string;
  textColor?: string;
  border?: string;
  radius?: number;
  shadow?: AppearanceShadow;
};

const shadowValues: Record<AppearanceShadow, string> = {
  none: "none",
  sm: "0 6px 18px rgb(32 55 94 / 8%)",
  md: "0 10px 24px rgb(32 55 94 / 12%)",
  lg: "0 16px 36px rgb(32 55 94 / 16%)"
};

export function getAppearanceStyle(options: AppearanceOptions): Record<string, string | number> {
  const radius = Number.isFinite(options.radius) ? Math.max(0, options.radius ?? 0) : undefined;
  const shadow = options.shadow && options.shadow in shadowValues ? options.shadow : undefined;
  return {
    ...(options.background ? { background: options.background } : {}),
    ...(options.textColor ? { color: options.textColor } : {}),
    ...(options.border ? { borderColor: options.border, borderStyle: "solid", borderWidth: 1 } : {}),
    ...(radius !== undefined ? { borderRadius: `${radius}px` } : {}),
    ...(shadow ? { boxShadow: shadowValues[shadow] } : {})
  };
}
