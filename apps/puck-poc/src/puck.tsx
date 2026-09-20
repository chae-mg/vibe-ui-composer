import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  Puck as PuckEditor,
  AutoField,
  usePuck,
  type Config,
  type Data,
  type Slot,
  type Field
} from "@puckeditor/core";
import {
  createDefaultProject,
  type ProjectDocument
} from "./project-schema";
import {
  projectToPuckData,
  puckDataToProject,
  validateProjectRoundTrip
} from "./puck-adapter";
import {
  GRID_COLUMN_PRESETS,
  setGridOverlay,
  updateGridSettings
} from "./project-operations";
import type { GridSettings } from "./project-schema";
import { ProjectRenderer } from "./renderer";
import {
  componentRegistry,
  getComponentDefinition,
  type ComponentType
} from "./component-registry";
import {
  getFlexLayoutStyle,
  getGridLayoutStyle,
  type LayoutAlign,
  type LayoutDirection,
  type LayoutHeightMode,
  type LayoutJustify,
  type LayoutWrap
} from "./layout-utils";
import { getAppearanceStyle, type AppearanceShadow } from "./appearance-utils";
import {
  RADIUS_OPTIONS,
  SHADOW_OPTIONS,
  SPACING_OPTIONS,
  TYPOGRAPHY_OPTIONS,
  getTypographyStyle,
  resolveSpacing,
  type SpacingToken,
  type TypographyRole
} from "./design-tokens";

const STORAGE_KEY = "ui-composer-puck-poc";

type HeadingProps = { text: string; level: "h1" | "h2" | "h3"; typographyRole?: TypographyRole };
type TextProps = { text: string; typographyRole?: TypographyRole };
type ButtonProps = { label: string; variant: "primary" | "secondary"; typographyRole?: TypographyRole };
type SectionProps = {
  title: string;
  tone: "surface" | "accent";
  background?: string;
  textColor?: string;
  border?: string;
  radius?: number | string;
  shadow?: AppearanceShadow;
  typographyRole?: TypographyRole;
  content: Slot;
};
type GridProps = {
  columns: number;
  gap: number | SpacingToken | string;
  padding: number | SpacingToken | string;
  align: LayoutAlign;
  justify: LayoutJustify;
  heightMode: LayoutHeightMode;
  height: number;
  showOverlay: boolean;
  content: Slot;
};
type CardProps = {
  title: string;
  body: string;
  span: number;
  tabletSpan: number;
  mobileSpan: number;
  background?: string;
  textColor?: string;
  border?: string;
  radius?: number | string;
  shadow?: AppearanceShadow;
  typographyRole?: TypographyRole;
  content: Slot;
};
type ContainerProps = {
  direction: LayoutDirection;
  wrap: LayoutWrap;
  align: LayoutAlign;
  justify: LayoutJustify;
  gap: number | SpacingToken | string;
  padding: number | SpacingToken | string;
  heightMode: LayoutHeightMode;
  height: number;
  content: Slot;
};
type FlexProps = Omit<ContainerProps, "direction"> & { direction: LayoutDirection };
type InputProps = { label: string; placeholder: string; inputType: "text" | "email" | "password" };
type SelectProps = { label: string; options: string };
type BadgeProps = { text: string; tone: "success" | "warning" | "danger" | "neutral" };
type DividerProps = { orientation: "horizontal" | "vertical" };
type TableProps = { title: string; columns: string };

type Components = {
  HeadingBlock: HeadingProps;
  TextBlock: TextProps;
  ButtonBlock: ButtonProps;
  SectionBlock: SectionProps;
  GridBlock: GridProps;
  CardBlock: CardProps;
  ContainerBlock: ContainerProps;
  FlexBlock: FlexProps;
  InputBlock: InputProps;
  SelectBlock: SelectProps;
  BadgeBlock: BadgeProps;
  DividerBlock: DividerProps;
  TableBlock: TableProps;
};

const registryProps = <T extends Parameters<typeof getComponentDefinition>[0]>(type: T) =>
  getComponentDefinition(type)?.defaultProps ?? {};

const PROJECT_TO_PUCK_COMPONENT: Record<ComponentType, string> = {
  Page: "root",
  Section: "SectionBlock",
  Container: "ContainerBlock",
  Flex: "FlexBlock",
  Grid: "GridBlock",
  Card: "CardBlock",
  Heading: "HeadingBlock",
  Text: "TextBlock",
  Button: "ButtonBlock",
  Input: "InputBlock",
  Select: "SelectBlock",
  Badge: "BadgeBlock",
  Divider: "DividerBlock",
  Table: "TableBlock"
};

const slotAllow = (type: ComponentType) =>
  getComponentDefinition(type)?.allowedChildren
    .map((childType) => PROJECT_TO_PUCK_COMPONENT[childType])
    .filter((componentName): componentName is string => Boolean(componentName && componentName !== "root")) ?? [];

const config: Config<Components> = {
  components: {
    HeadingBlock: {
      label: getComponentDefinition("Heading")?.label ?? "Heading",
      fields: {
        text: { type: "text" },
        level: {
          type: "select",
          options: [
            { label: "Heading 1", value: "h1" },
            { label: "Heading 2", value: "h2" },
            { label: "Heading 3", value: "h3" }
          ]
        },
        typographyRole: { type: "select", options: TYPOGRAPHY_OPTIONS }
      },
      defaultProps: registryProps("Heading") as HeadingProps,
      render: ({ text, level, typographyRole }: HeadingProps) => {
        const Heading = level;
        return <Heading className="poc-heading" style={getTypographyStyle(typographyRole, "heading-1") as CSSProperties}>{text}</Heading>;
      }
    },
    TextBlock: {
      label: getComponentDefinition("Text")?.label ?? "Text",
      fields: { text: { type: "textarea" }, typographyRole: { type: "select", options: TYPOGRAPHY_OPTIONS } },
      defaultProps: registryProps("Text") as TextProps,
      render: ({ text, typographyRole }: TextProps) => <p className="poc-text" style={getTypographyStyle(typographyRole, "body") as CSSProperties}>{text}</p>
    },
    ButtonBlock: {
      label: getComponentDefinition("Button")?.label ?? "Button",
      fields: {
        label: { type: "text" },
        variant: {
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" }
          ]
        },
        typographyRole: { type: "select", options: TYPOGRAPHY_OPTIONS }
      },
      defaultProps: registryProps("Button") as ButtonProps,
      render: ({ label, variant, typographyRole }: ButtonProps) => (
        <button className={"poc-button poc-button--" + variant} style={getTypographyStyle(typographyRole, "body") as CSSProperties} type="button">
          {label}
        </button>
      )
    },
    SectionBlock: {
      label: getComponentDefinition("Section")?.label ?? "Section",
      fields: {
        title: { type: "text" },
        tone: {
          type: "select",
          options: [
            { label: "Surface", value: "surface" },
            { label: "Accent", value: "accent" }
          ]
        },
        background: { type: "text" },
        textColor: { type: "text" },
        border: { type: "text" },
        radius: { type: "select", options: RADIUS_OPTIONS },
        shadow: { type: "select", options: SHADOW_OPTIONS },
        typographyRole: { type: "select", options: TYPOGRAPHY_OPTIONS },
        content: {
          type: "slot",
          allow: slotAllow("Section")
        }
      },
      defaultProps: registryProps("Section") as SectionProps,
      render: ({ title, tone, background, textColor, border, radius, shadow, typographyRole, content: Content }) => (
        <section className={"poc-section poc-section--" + tone} style={getAppearanceStyle({ background, textColor, border, radius, shadow }) as CSSProperties}>
          <h2 style={getTypographyStyle(typographyRole, "heading-2") as CSSProperties}>{title}</h2>
          <Content className="poc-slot" />
        </section>
      )
    },
    GridBlock: {
      label: getComponentDefinition("Grid")?.label ?? "Grid",
      fields: {
        columns: { type: "number", min: 1, max: 24 },
        gap: { type: "select", options: SPACING_OPTIONS },
        padding: { type: "select", options: SPACING_OPTIONS },
        align: { type: "select", options: [{ label: "Stretch", value: "stretch" }, { label: "Start", value: "start" }, { label: "Center", value: "center" }, { label: "End", value: "end" }] },
        justify: { type: "select", options: [{ label: "Stretch", value: "stretch" }, { label: "Start", value: "start" }, { label: "Center", value: "center" }, { label: "End", value: "end" }] },
        heightMode: { type: "select", options: [{ label: "Auto", value: "auto" }, { label: "Fixed", value: "fixed" }, { label: "Min height", value: "min" }, { label: "Fill", value: "fill" }] },
        height: { type: "number", min: 0, max: 1200 },
        showOverlay: {
          type: "radio",
          options: [
            { label: "Show overlay", value: true },
            { label: "Hide overlay", value: false }
          ]
        },
        content: {
          type: "slot",
          allow: slotAllow("Grid")
        }
      },
      defaultProps: registryProps("Grid") as GridProps,
      render: ({ columns, gap, padding, align, justify, heightMode, height, showOverlay, content: Content }) => {
        const resolvedGap = resolveSpacing(gap, 24);
        const resolvedPadding = resolveSpacing(padding, 16);
        const gridStyle = {
          ...getGridLayoutStyle({ columns, gap: resolvedGap, padding: resolvedPadding, align, justify, heightMode, height }),
          "--poc-grid-columns": columns,
          "--poc-grid-gap": `${resolvedGap}px`,
          "--poc-grid-padding": `${resolvedPadding}px`
        } as CSSProperties;

        return (
          <div className="poc-grid" style={gridStyle}>
            {showOverlay ? (
              <div className="poc-grid-overlay" aria-hidden="true">
                {Array.from({ length: columns }, (_, index) => (
                  <span key={index}>{index + 1}</span>
                ))}
              </div>
            ) : null}
            <Content className="poc-grid-content" />
          </div>
        );
      }
    },
    CardBlock: {
      label: getComponentDefinition("Card")?.label ?? "Card",
      inline: true,
      fields: {
        title: { type: "text" },
        body: { type: "text" },
        span: { type: "number", min: 1, max: 12 },
        tabletSpan: { type: "number", min: 1, max: 8 },
        mobileSpan: { type: "number", min: 1, max: 4 },
        background: { type: "text" },
        textColor: { type: "text" },
        border: { type: "text" },
        radius: { type: "select", options: RADIUS_OPTIONS },
        shadow: { type: "select", options: SHADOW_OPTIONS },
        typographyRole: { type: "select", options: TYPOGRAPHY_OPTIONS },
        content: { type: "slot", allow: slotAllow("Card") }
      },
      defaultProps: registryProps("Card") as CardProps,
      render: ({ title, body, span, tabletSpan, mobileSpan, background, textColor, border, radius, shadow, typographyRole, content: Content, puck }) => (
        <article
          ref={puck.dragRef}
          className="poc-card"
          style={{
            gridColumn: `span ${span}`,
            "--poc-card-span-tablet": tabletSpan,
            "--poc-card-span-mobile": mobileSpan,
            ...getAppearanceStyle({ background, textColor, border, radius, shadow })
          } as CSSProperties}
        >
          <strong style={getTypographyStyle(typographyRole, "title") as CSSProperties}>{title}</strong>
          <span className="poc-card-value" style={getTypographyStyle(typographyRole, "body-large") as CSSProperties}>{body}</span>
          <Content className="poc-card-content poc-slot" />
        </article>
      )
    },
    ContainerBlock: {
      label: getComponentDefinition("Container")?.label ?? "Container",
      fields: {
        direction: { type: "select", options: [{ label: "Stack", value: "column" }, { label: "Row", value: "row" }] },
        wrap: { type: "select", options: [{ label: "No wrap", value: "nowrap" }, { label: "Wrap", value: "wrap" }] },
        align: { type: "select", options: [{ label: "Stretch", value: "stretch" }, { label: "Start", value: "start" }, { label: "Center", value: "center" }, { label: "End", value: "end" }] },
        justify: { type: "select", options: [{ label: "Start", value: "start" }, { label: "Center", value: "center" }, { label: "End", value: "end" }, { label: "Between", value: "between" }] },
        gap: { type: "select", options: SPACING_OPTIONS },
        padding: { type: "select", options: SPACING_OPTIONS },
        heightMode: { type: "select", options: [{ label: "Auto", value: "auto" }, { label: "Fixed", value: "fixed" }, { label: "Min height", value: "min" }, { label: "Fill", value: "fill" }] },
        height: { type: "number", min: 0, max: 1200 },
        content: { type: "slot", allow: slotAllow("Container") }
      },
      defaultProps: registryProps("Container") as ContainerProps,
      render: ({ direction = "column", wrap = "nowrap", align = "stretch", justify = "start", gap = "space.16", padding = "space.16", heightMode = "auto", height = 240, content: Content }) => (
        <div className="poc-renderer-container" style={getFlexLayoutStyle({ direction, wrap, align, justify, gap: resolveSpacing(gap, 16), padding: resolveSpacing(padding, 16), heightMode, height }) as CSSProperties}><Content className="poc-slot" /></div>
      )
    },
    FlexBlock: {
      label: getComponentDefinition("Flex")?.label ?? "Flex",
      fields: {
        direction: { type: "select", options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }] },
        wrap: { type: "select", options: [{ label: "No wrap", value: "nowrap" }, { label: "Wrap", value: "wrap" }, { label: "Wrap reverse", value: "wrap-reverse" }] },
        align: { type: "select", options: [{ label: "Stretch", value: "stretch" }, { label: "Start", value: "start" }, { label: "Center", value: "center" }, { label: "End", value: "end" }] },
        justify: { type: "select", options: [{ label: "Start", value: "start" }, { label: "Center", value: "center" }, { label: "End", value: "end" }, { label: "Between", value: "between" }] },
        gap: { type: "select", options: SPACING_OPTIONS },
        padding: { type: "select", options: SPACING_OPTIONS },
        heightMode: { type: "select", options: [{ label: "Auto", value: "auto" }, { label: "Fixed", value: "fixed" }, { label: "Min height", value: "min" }, { label: "Fill", value: "fill" }] },
        height: { type: "number", min: 0, max: 1200 },
        content: { type: "slot", allow: slotAllow("Flex") }
      },
      defaultProps: registryProps("Flex") as FlexProps,
      render: ({ direction = "row", wrap = "nowrap", align = "stretch", justify = "start", gap = "space.16", padding = "space.0", heightMode = "auto", height = 240, content: Content }) => (
        <div className="poc-renderer-flex" style={getFlexLayoutStyle({ direction, wrap, align, justify, gap: resolveSpacing(gap, 16), padding: resolveSpacing(padding, 0), heightMode, height }) as CSSProperties}><Content className="poc-slot" /></div>
      )
    },
    InputBlock: {
      label: getComponentDefinition("Input")?.label ?? "Input",
      fields: {
        label: { type: "text" },
        placeholder: { type: "text" },
        inputType: { type: "select", options: [{ label: "Text", value: "text" }, { label: "Email", value: "email" }, { label: "Password", value: "password" }] }
      },
      defaultProps: registryProps("Input") as InputProps,
      render: ({ label, placeholder, inputType }: InputProps) => <label className="poc-field"><span>{label}</span><input className="poc-input" type={inputType} placeholder={placeholder} /></label>
    },
    SelectBlock: {
      label: getComponentDefinition("Select")?.label ?? "Select",
      fields: { label: { type: "text" }, options: { type: "textarea" } },
      defaultProps: registryProps("Select") as SelectProps,
      render: ({ label, options }: SelectProps) => <label className="poc-field"><span>{label}</span><select className="poc-input">{options.split("\n").filter(Boolean).map((option) => <option key={option}>{option}</option>)}</select></label>
    },
    BadgeBlock: {
      label: getComponentDefinition("Badge")?.label ?? "Badge",
      fields: {
        text: { type: "text" },
        tone: { type: "select", options: [{ label: "Success", value: "success" }, { label: "Warning", value: "warning" }, { label: "Danger", value: "danger" }, { label: "Neutral", value: "neutral" }] }
      },
      defaultProps: registryProps("Badge") as BadgeProps,
      render: ({ text, tone }: BadgeProps) => <span className={`poc-badge poc-badge--${tone}`}>{text}</span>
    },
    DividerBlock: {
      label: getComponentDefinition("Divider")?.label ?? "Divider",
      fields: { orientation: { type: "select", options: [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }] } },
      defaultProps: registryProps("Divider") as DividerProps,
      render: ({ orientation }: DividerProps) => <div className={`poc-divider poc-divider--${orientation}`} role="separator" />
    },
    TableBlock: {
      label: getComponentDefinition("Table")?.label ?? "Table",
      fields: { title: { type: "text" }, columns: { type: "textarea" } },
      defaultProps: registryProps("Table") as TableProps,
      render: ({ title, columns }: TableProps) => <div className="poc-table-wrap"><strong>{title}</strong><table className="poc-table"><thead><tr>{columns.split("\n").filter(Boolean).map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody><tr>{columns.split("\n").filter(Boolean).map((column) => <td key={column}>—</td>)}</tr></tbody></table></div>
    }
  },
  root: {
    fields: {
      title: { type: "text" },
      gridMargin: { type: "number", min: 0, max: 128, visible: false }
    },
    render: ({ title, children, gridMargin }) => {
      const margin = typeof gridMargin === "number" && Number.isFinite(gridMargin) ? gridMargin : 32;
      return (
        <main className="poc-page" style={{ "--poc-page-margin": `${margin}px` } as CSSProperties}>
          <div className="poc-page-title">{title}</div>
          {children}
        </main>
      );
    }
  }
};

const defaultData: Data = projectToPuckData(createDefaultProject());

type StoredState = {
  puckData: Data;
  project?: ProjectDocument;
};

type PropertyTab = "Layout" | "Size" | "Spacing" | "Typography" | "Appearance" | "Props";

const PROPERTY_TABS: PropertyTab[] = ["Layout", "Size", "Spacing", "Typography", "Appearance", "Props"];
const LAYOUT_PROPERTIES = new Set(["direction", "wrap", "align", "justify", "columns", "showOverlay"]);
const SIZE_PROPERTIES = new Set(["heightMode", "height", "span", "tabletSpan", "mobileSpan"]);
const SPACING_PROPERTIES = new Set(["gap", "padding"]);
const TYPOGRAPHY_PROPERTIES = new Set(["text", "level", "title", "label", "body", "variant", "tone", "orientation", "options", "columns", "typographyRole"]);
const APPEARANCE_PROPERTIES = new Set(["background", "textColor", "border", "radius", "shadow"]);

function getPropertyTab(name: string): PropertyTab {
  if (LAYOUT_PROPERTIES.has(name)) return "Layout";
  if (SIZE_PROPERTIES.has(name)) return "Size";
  if (SPACING_PROPERTIES.has(name)) return "Spacing";
  if (TYPOGRAPHY_PROPERTIES.has(name)) return "Typography";
  if (APPEARANCE_PROPERTIES.has(name)) return "Appearance";
  return "Props";
}

function humanizePropertyName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase());
}

function updatePuckDataValue(data: Data, targetId: string | null, name: string, value: unknown): Data {
  const updateContent = (content: Array<Record<string, any>>): Array<Record<string, any>> => content.map((item) => {
    const props = item.props ?? {};
    const nextProps = item.props?.id === targetId ? { ...props, [name]: value } : props;
    const nestedProps = Object.fromEntries(
      Object.entries(nextProps).map(([key, propValue]) => [
        key,
        Array.isArray(propValue) && propValue.every((child) => child && typeof child === "object" && "type" in child)
          ? updateContent(propValue as Array<Record<string, any>>)
          : propValue
      ])
    );
    return { ...item, props: nestedProps };
  });

  return {
    ...data,
    root: targetId === null
      ? { ...data.root, props: { ...data.root?.props, [name]: value } }
      : data.root,
    content: updateContent((data.content ?? []) as Array<Record<string, any>>) as Data["content"]
  };
}

function PropertiesPanel({ children, isLoading }: { children: ReactNode; isLoading: boolean }) {
  const { selectedItem, appState, config: puckConfig, dispatch } = usePuck();
  const [activeTab, setActiveTab] = useState<PropertyTab>("Layout");
  const itemType = selectedItem?.type ?? "root";
  const targetId = typeof selectedItem?.props?.id === "string" ? selectedItem.props.id : null;
  const itemProps = selectedItem?.props ?? appState.data.root?.props ?? {};
  const fieldsByName = itemType === "root"
    ? (puckConfig.root?.fields ?? {})
    : ((puckConfig.components as Record<string, { fields?: Record<string, Field> }>)[itemType]?.fields ?? {});
  const registryType = Object.entries(PROJECT_TO_PUCK_COMPONENT).find(([, puckType]) => puckType === itemType)?.[0] as ComponentType | undefined;
  const registrySchema = registryType ? getComponentDefinition(registryType)?.propertySchema : undefined;
  const fields = Object.entries(fieldsByName).filter(([name, field]) => field.type !== "slot" && field.visible !== false);

  useEffect(() => {
    setActiveTab("Layout");
  }, [itemType, targetId]);

  const visibleFields = fields.filter(([name]) => getPropertyTab(name) === activeTab);
  const onFieldChange = (name: string, value: unknown) => {
    dispatch({
      type: "setData",
      recordHistory: true,
      data: (previous) => updatePuckDataValue(previous, targetId, name, value)
    });
  };

  return (
    <div className="poc-properties-panel" aria-label="Properties panel">
      <div className="poc-properties-panel__header">
        <div>
          <strong>Properties</strong>
          <span>{itemType === "root" ? "Page" : registryType ? getComponentDefinition(registryType)?.label : itemType}</span>
        </div>
        <span className="poc-properties-panel__count">{fields.length} fields</span>
      </div>
      {isLoading ? <div className="poc-properties-panel__empty">Loading properties…</div> : null}
      <div className="poc-properties-panel__tabs" role="tablist" aria-label="Property categories">
        {PROPERTY_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "is-active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {visibleFields.length > 0 ? (
        <div className="poc-properties-panel__fields">
          {visibleFields.map(([name, rawField]) => {
            const field = {
              ...rawField,
              label: rawField.label ?? registrySchema?.[name]?.label ?? humanizePropertyName(name)
            } as Field;
            return (
              <AutoField
                key={name}
                id={`property-${targetId ?? "root"}-${name}`}
                field={field as any}
                value={(itemProps as Record<string, unknown>)[name]}
                onChange={(value) => onFieldChange(name, value)}
              />
            );
          })}
        </div>
      ) : (
        <div className="poc-properties-panel__empty">
          {fields.length > 0 ? `${activeTab} 속성이 없습니다.` : "편집 가능한 속성이 없습니다."}
        </div>
      )}
      {fields.length === 0 ? <div className="poc-properties-panel__fallback">{children}</div> : null}
    </div>
  );
}

function loadStoredState(): StoredState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { puckData: defaultData };
    }

    const parsed = JSON.parse(saved) as Data | StoredState;
    if ("puckData" in parsed && parsed.puckData) {
      return { puckData: parsed.puckData, project: parsed.project };
    }
    return { puckData: parsed as Data };
  } catch {
    return { puckData: defaultData };
  }
}

export function Puck() {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showSchemaRenderer, setShowSchemaRenderer] = useState(false);
  const storedState = useMemo(loadStoredState, []);
  const initialData = storedState.puckData;
  const initialProject = useMemo<ProjectDocument>(
    () => puckDataToProject(
      initialData,
      storedState.project?.name ?? "Vibe Coding UI Composer",
      storedState.project
    ),
    [initialData, storedState.project]
  );
  const [currentProject, setCurrentProject] = useState(initialProject);
  const [editorData, setEditorData] = useState(initialData);
  const initialGridOverlay = useMemo(() => {
    const gridNode = Object.values(initialProject.nodes).find((node) => node.type === "Grid");
    return gridNode?.props.showOverlay !== false;
  }, [initialProject]);
  const [gridOverlayVisible, setGridOverlayVisible] = useState(initialGridOverlay);
  const validation = useMemo(
    () => validateProjectRoundTrip(currentProject),
    [currentProject]
  );

  const persist = (data: Data) => {
    const project = puckDataToProject(data, currentProject.name, currentProject);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ puckData: data, project })
    );
    setEditorData(data);
    setCurrentProject(project);
    const gridNode = Object.values(project.nodes).find((node) => node.type === "Grid");
    if (gridNode) setGridOverlayVisible(gridNode.props.showOverlay !== false);
    setSavedAt(new Date().toLocaleTimeString("ko-KR"));
  };

  const persistProject = (project: ProjectDocument) => {
    const data = projectToPuckData(project);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ puckData: data, project })
    );
    setEditorData(data);
    setCurrentProject(project);
    setSavedAt(new Date().toLocaleTimeString("ko-KR"));
  };

  const updateDesktopGrid = (patch: Partial<GridSettings>) => {
    persistProject(updateGridSettings(currentProject, "desktop", patch));
  };

  const toggleGridOverlay = () => {
    const visible = !gridOverlayVisible;
    setGridOverlayVisible(visible);
    persistProject(setGridOverlay(currentProject, visible));
  };

  const validationPassed = validation.schemaVersion && validation.validProject;

  return (
    <div className="poc-shell">
      <div className="poc-status" aria-live="polite">
        <span>Phase 8 · design token validation</span>
        <span>
          {validationPassed
            ? `Tokens ✓ · Properties ✓ · Layout ✓ · Grid ✓ · Canvas DnD ✓ · Registry ✓ · ${componentRegistry.length} components · ${Object.keys(currentProject.nodes).length} nodes`
            : "Schema adapter needs review"}
          {savedAt ? " · Saved " + savedAt : ""}
        </span>
        <button
          className="poc-renderer-toggle"
          type="button"
          onClick={() => setShowSchemaRenderer((visible) => !visible)}
        >
          {showSchemaRenderer ? "Hide schema renderer" : "Open schema renderer"}
        </button>
      </div>
      <div className="poc-grid-toolbar" aria-label="Desktop grid settings">
        <strong>Desktop Grid</strong>
        <label>
          Columns
          <select
            value={currentProject.grid.desktop.columns}
            onChange={(event) => updateDesktopGrid({ columns: Number(event.target.value) })}
          >
            {GRID_COLUMN_PRESETS.map((columns) => <option key={columns} value={columns}>{columns}</option>)}
          </select>
        </label>
        <label>
          Gutter
          <input
            type="number"
            min={0}
            max={96}
            step={1}
            value={currentProject.grid.desktop.gutter}
            onChange={(event) => updateDesktopGrid({ gutter: Number(event.target.value) })}
          />
          <span>px</span>
        </label>
        <label>
          Margin
          <input
            type="number"
            min={0}
            max={128}
            step={1}
            value={currentProject.grid.desktop.margin}
            onChange={(event) => updateDesktopGrid({ margin: Number(event.target.value) })}
          />
          <span>px</span>
        </label>
        <button
          className="poc-grid-toggle"
          type="button"
          aria-pressed={gridOverlayVisible}
          onClick={toggleGridOverlay}
        >
          {gridOverlayVisible ? "Hide grid overlay" : "Show grid overlay"}
        </button>
      </div>
      {showSchemaRenderer ? (
        <section className="poc-schema-preview" aria-label="Independent schema renderer">
          <div className="poc-schema-preview__header">
            <strong>Independent Project JSON Renderer</strong>
            <span>{currentProject.name} · {currentProject.schemaVersion}</span>
          </div>
          <ProjectRenderer project={currentProject} breakpoint="desktop" />
        </section>
      ) : null}
      <PuckEditor
        config={config}
        data={editorData}
        ui={{ leftSideBarVisible: true, rightSideBarVisible: true }}
        overrides={{ fields: PropertiesPanel }}
        onChange={persist}
        onPublish={persist}
        headerTitle="UI Composer PoC"
        headerPath="/apps/puck-poc"
        viewports={[
          { width: 390, height: "auto", label: "Mobile" },
          { width: 768, height: "auto", label: "Tablet" },
          { width: 1440, height: "auto", label: "Desktop" }
        ]}
      />
    </div>
  );
}
