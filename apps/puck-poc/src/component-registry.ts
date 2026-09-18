export type ComponentType =
  | "Page"
  | "Section"
  | "Container"
  | "Flex"
  | "Grid"
  | "Card"
  | "Heading"
  | "Text"
  | "Button"
  | "Input"
  | "Select"
  | "Badge"
  | "Divider"
  | "Table";

export type ComponentCategory = "layout" | "content" | "form" | "display";

export type PropertyOption = { label: string; value: string };

export type PropertySchema = {
  type: "text" | "textarea" | "number" | "select" | "slot";
  label?: string;
  min?: number;
  max?: number;
  options?: PropertyOption[];
  allow?: ComponentType[];
};

export type ComponentDefinition = {
  type: ComponentType;
  label: string;
  icon: string;
  category: ComponentCategory;
  defaultProps: Record<string, unknown>;
  defaultStyle: Record<string, string | number>;
  variants: string[];
  allowedChildren: ComponentType[];
  canHaveChildren: boolean;
  resizeRules: {
    minSpan: number;
    maxSpan: number;
    snap: "grid" | "free";
  };
  propertySchema: Record<string, PropertySchema>;
};

const allContent: ComponentType[] = [
  "Section",
  "Container",
  "Flex",
  "Grid",
  "Card",
  "Heading",
  "Text",
  "Button",
  "Input",
  "Select",
  "Badge",
  "Divider",
  "Table"
];

export const componentRegistry: ComponentDefinition[] = [
  {
    type: "Page",
    label: "Page",
    icon: "layout",
    category: "layout",
    defaultProps: { title: "Vibe Coding UI Composer" },
    defaultStyle: {},
    variants: [],
    allowedChildren: allContent,
    canHaveChildren: true,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: { title: { type: "text", label: "Title" } }
  },
  {
    type: "Section",
    label: "Section",
    icon: "section",
    category: "layout",
    defaultProps: { title: "Section", tone: "surface", content: [] },
    defaultStyle: { radius: 16, padding: 24 },
    variants: ["surface", "accent"],
    allowedChildren: ["Heading", "Text", "Button", "Container", "Flex", "Grid", "Card", "Input", "Select", "Badge", "Divider", "Table"],
    canHaveChildren: true,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: {
      title: { type: "text", label: "Title" },
      tone: {
        type: "select",
        label: "Tone",
        options: [
          { label: "Surface", value: "surface" },
          { label: "Accent", value: "accent" }
        ]
      },
      content: { type: "slot", allow: ["Text", "Button", "Container", "Flex", "Grid", "Card", "Input", "Select", "Badge", "Divider", "Table"] }
    }
  },
  {
    type: "Container",
    label: "Container",
    icon: "container",
    category: "layout",
    defaultProps: { content: [] },
    defaultStyle: { padding: 16 },
    variants: [],
    allowedChildren: ["Text", "Button", "Heading", "Flex", "Grid", "Card", "Input", "Select", "Badge", "Divider", "Table"],
    canHaveChildren: true,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: { content: { type: "slot", allow: ["Text", "Button", "Flex", "Grid", "Card", "Input", "Select", "Badge", "Divider", "Table"] } }
  },
  {
    type: "Flex",
    label: "Flex",
    icon: "flex",
    category: "layout",
    defaultProps: { direction: "row", gap: 16, content: [] },
    defaultStyle: {},
    variants: ["row", "column"],
    allowedChildren: ["Text", "Button", "Card", "Input", "Select", "Badge", "Divider", "Table"],
    canHaveChildren: true,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: {
      direction: { type: "select", label: "Direction", options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }] },
      gap: { type: "number", label: "Gap", min: 0, max: 64 },
      content: { type: "slot", allow: ["Text", "Button", "Card", "Input", "Select", "Badge", "Divider", "Table"] }
    }
  },
  {
    type: "Grid",
    label: "Grid",
    icon: "grid",
    category: "layout",
    defaultProps: { columns: 12, gap: 16, content: [] },
    defaultStyle: {},
    variants: [],
    allowedChildren: ["Card", "Heading", "Text", "Button", "Input", "Select", "Badge", "Divider", "Table"],
    canHaveChildren: true,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: {
      columns: { type: "number", label: "Columns", min: 1, max: 12 },
      gap: { type: "number", label: "Gap", min: 0, max: 64 },
      content: { type: "slot", allow: ["Card", "Text", "Button", "Input", "Select", "Badge", "Divider", "Table"] }
    }
  },
  {
    type: "Card",
    label: "Card",
    icon: "card",
    category: "layout",
    defaultProps: { title: "Card", body: "Card content", span: 6, tabletSpan: 6, mobileSpan: 4 },
    defaultStyle: { radius: 12, padding: 16 },
    variants: [],
    allowedChildren: ["Text", "Button", "Badge", "Divider"],
    canHaveChildren: true,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: {
      title: { type: "text", label: "Title" },
      body: { type: "text", label: "Body" },
      span: { type: "number", label: "Desktop span", min: 1, max: 12 },
      tabletSpan: { type: "number", label: "Tablet span", min: 1, max: 8 },
      mobileSpan: { type: "number", label: "Mobile span", min: 1, max: 4 },
      content: { type: "slot", allow: ["Text", "Button", "Badge", "Divider"] }
    }
  },
  {
    type: "Heading",
    label: "Heading",
    icon: "heading",
    category: "content",
    defaultProps: { text: "Build your interface", level: "h1" },
    defaultStyle: {},
    variants: ["h1", "h2", "h3"],
    allowedChildren: [],
    canHaveChildren: false,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: {
      text: { type: "text", label: "Text" },
      level: { type: "select", label: "Level", options: [{ label: "Heading 1", value: "h1" }, { label: "Heading 2", value: "h2" }, { label: "Heading 3", value: "h3" }] }
    }
  },
  {
    type: "Text",
    label: "Text",
    icon: "text",
    category: "content",
    defaultProps: { text: "Write something useful." },
    defaultStyle: {},
    variants: [],
    allowedChildren: [],
    canHaveChildren: false,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: { text: { type: "textarea", label: "Text" } }
  },
  {
    type: "Button",
    label: "Button",
    icon: "button",
    category: "content",
    defaultProps: { label: "Continue", variant: "primary" },
    defaultStyle: { radius: 8 },
    variants: ["primary", "secondary"],
    allowedChildren: [],
    canHaveChildren: false,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: {
      label: { type: "text", label: "Label" },
      variant: { type: "select", label: "Variant", options: [{ label: "Primary", value: "primary" }, { label: "Secondary", value: "secondary" }] }
    }
  },
  {
    type: "Input",
    label: "Input",
    icon: "input",
    category: "form",
    defaultProps: { label: "Email", placeholder: "you@example.com", inputType: "text" },
    defaultStyle: { radius: 8 },
    variants: ["text", "password", "email"],
    allowedChildren: [],
    canHaveChildren: false,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: {
      label: { type: "text", label: "Label" },
      placeholder: { type: "text", label: "Placeholder" },
      inputType: { type: "select", label: "Type", options: [{ label: "Text", value: "text" }, { label: "Email", value: "email" }, { label: "Password", value: "password" }] }
    }
  },
  {
    type: "Select",
    label: "Select",
    icon: "select",
    category: "form",
    defaultProps: { label: "Status", options: "Draft\nPublished" },
    defaultStyle: { radius: 8 },
    variants: [],
    allowedChildren: [],
    canHaveChildren: false,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: { label: { type: "text", label: "Label" }, options: { type: "textarea", label: "Options (one per line)" } }
  },
  {
    type: "Badge",
    label: "Badge",
    icon: "badge",
    category: "display",
    defaultProps: { text: "Active", tone: "success" },
    defaultStyle: { radius: "full" },
    variants: ["success", "warning", "danger", "neutral"],
    allowedChildren: [],
    canHaveChildren: false,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: {
      text: { type: "text", label: "Text" },
      tone: { type: "select", label: "Tone", options: [{ label: "Success", value: "success" }, { label: "Warning", value: "warning" }, { label: "Danger", value: "danger" }, { label: "Neutral", value: "neutral" }] }
    }
  },
  {
    type: "Divider",
    label: "Divider",
    icon: "divider",
    category: "display",
    defaultProps: { orientation: "horizontal" },
    defaultStyle: {},
    variants: ["horizontal", "vertical"],
    allowedChildren: [],
    canHaveChildren: false,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: { orientation: { type: "select", label: "Orientation", options: [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }] } }
  },
  {
    type: "Table",
    label: "Table",
    icon: "table",
    category: "display",
    defaultProps: { title: "Recent activity", columns: "Name\nStatus\nUpdated" },
    defaultStyle: { radius: 12 },
    variants: ["compact"],
    allowedChildren: [],
    canHaveChildren: false,
    resizeRules: { minSpan: 1, maxSpan: 12, snap: "grid" },
    propertySchema: { title: { type: "text", label: "Title" }, columns: { type: "textarea", label: "Columns (one per line)" } }
  }
];

const registryMap = new Map(componentRegistry.map((definition) => [definition.type, definition]));

export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  return registryMap.get(type as ComponentType);
}

export function getDefaultProps(type: string): Record<string, unknown> {
  return { ...(getComponentDefinition(type)?.defaultProps ?? {}) };
}

export function canAcceptChild(parentType: string, childType: string): boolean {
  const parent = getComponentDefinition(parentType);
  return Boolean(parent?.canHaveChildren && parent.allowedChildren.includes(childType as ComponentType));
}

export function getRegistrySummary() {
  return componentRegistry.map(({ type, category, canHaveChildren }) => ({ type, category, canHaveChildren }));
}
