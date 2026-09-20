import { resolveRadius, resolveShadow, type ShadowToken } from "./design-tokens";

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
    ...(options.background ? { background: options.background } : {}),
    ...(options.textColor ? { color: options.textColor } : {}),
    ...(options.border ? { borderColor: options.border, borderStyle: "solid", borderWidth: 1 } : {}),
    ...(radius !== undefined ? { borderRadius: `${radius}px` } : {}),
    ...(shadow ? { boxShadow: shadow } : {})
  };
}
