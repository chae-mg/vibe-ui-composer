export type LayoutDirection = "row" | "column";
export type LayoutWrap = "nowrap" | "wrap" | "wrap-reverse";
export type LayoutAlign = "stretch" | "start" | "center" | "end";
export type LayoutJustify = "start" | "center" | "end" | "between" | "stretch";
export type LayoutHeightMode = "auto" | "fixed" | "min" | "fill";

type LayoutStyleOptions = {
  direction?: LayoutDirection;
  wrap?: LayoutWrap;
  align?: LayoutAlign;
  justify?: LayoutJustify;
  gap?: number;
  padding?: number;
  heightMode?: LayoutHeightMode;
  height?: number;
};

const alignmentValues: Record<LayoutAlign, string> = {
  stretch: "stretch",
  start: "flex-start",
  center: "center",
  end: "flex-end"
};

const justifyValues: Record<LayoutJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  stretch: "stretch"
};

function heightStyle(options: LayoutStyleOptions): Record<string, string> {
  const height = Number.isFinite(options.height) ? Math.max(0, options.height ?? 0) : 240;
  switch (options.heightMode) {
    case "fixed":
      return { height: `${height}px` };
    case "min":
      return { minHeight: `${height}px` };
    case "fill":
      return { height: "100%", minHeight: `${height}px` };
    default:
      return {};
  }
}

export function getFlexLayoutStyle(options: LayoutStyleOptions): Record<string, string | number> {
  const align = options.align ? alignmentValues[options.align] ?? "stretch" : undefined;
  const justify = options.justify ? justifyValues[options.justify] ?? "flex-start" : undefined;
  return {
    display: "flex",
    ...(options.direction ? { flexDirection: options.direction } : {}),
    ...(options.wrap ? { flexWrap: options.wrap } : {}),
    ...(align ? { alignItems: align } : {}),
    ...(justify ? { justifyContent: justify } : {}),
    ...(Number.isFinite(options.gap) ? { gap: `${Math.max(0, options.gap ?? 0)}px` } : {}),
    ...(Number.isFinite(options.padding) ? { padding: `${Math.max(0, options.padding ?? 0)}px` } : {}),
    ...heightStyle(options)
  };
}

export function getGridLayoutStyle(options: LayoutStyleOptions & { columns: number }): Record<string, string | number> {
  const align = options.align ? alignmentValues[options.align] ?? "stretch" : undefined;
  const justify = options.justify ? justifyValues[options.justify] ?? "stretch" : undefined;
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${Math.max(1, Math.round(options.columns))}, minmax(0, 1fr))`,
    ...(align ? { alignItems: align } : {}),
    ...(justify ? { justifyItems: justify } : {}),
    ...(Number.isFinite(options.gap) ? { gap: `${Math.max(0, options.gap ?? 0)}px` } : {}),
    ...(Number.isFinite(options.padding) ? { padding: `${Math.max(0, options.padding ?? 0)}px` } : {}),
    ...heightStyle(options)
  };
}
