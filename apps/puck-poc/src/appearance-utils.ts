import { resolveRadius, resolveShadow, type ShadowToken } from "./design-tokens";
import { resolveThemeColor } from "./theme-utils";

export type AppearanceShadow = ShadowToken | "none" | "sm" | "md" | "lg";

type AppearanceOptions = {
  background?: string;
  textColor?: string;
  border?: string;
  radius?: number | string;
  shadow?: AppearanceShadow;
};

export function getAppearanceStyle(options: AppearanceOptions): Record<string, string | number> {
  const radius = options.radius !== undefined ? resolveRadius(options.radius, 0) : undefined;
  const shadow = options.shadow ? resolveShadow(options.shadow, "shadow.none") : undefined;
  return {
    ...(options.background ? { background: resolveThemeColor(options.background) } : {}),
    ...(options.textColor ? { color: resolveThemeColor(options.textColor, "text") } : {}),
    ...(options.border ? { borderColor: resolveThemeColor(options.border, "border"), borderStyle: "solid", borderWidth: 1 } : {}),
    ...(radius !== undefined ? { borderRadius: typeof radius === "number" ? `${radius}px` : radius } : {}),
    ...(shadow ? { boxShadow: shadow } : {})
  };
}
