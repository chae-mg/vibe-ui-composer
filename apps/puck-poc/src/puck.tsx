import { useMemo, useState } from "react";
import {
  Puck as PuckEditor,
  type Config,
  type Data,
  type Slot
} from "@puckeditor/core";
import type { CSSProperties } from "react";
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

const STORAGE_KEY = "ui-composer-puck-poc";

type HeadingProps = { text: string; level: "h1" | "h2" | "h3" };
type TextProps = { text: string };
type ButtonProps = { label: string; variant: "primary" | "secondary" };
type SectionProps = {
  title: string;
  tone: "surface" | "accent";
  content: Slot;
};
type GridProps = {
  columns: number;
  gap: number;
  showOverlay: boolean;
  content: Slot;
};
type CardProps = {
  title: string;
  body: string;
  span: number;
  tabletSpan: number;
  mobileSpan: number;
  content: Slot;
};
type ContainerProps = { content: Slot };
type FlexProps = { direction: "row" | "column"; gap: number; content: Slot };
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
        }
      },
      defaultProps: registryProps("Heading") as HeadingProps,
      render: ({ text, level }: HeadingProps) => {
        const Heading = level;
        return <Heading className="poc-heading">{text}</Heading>;
      }
    },
    TextBlock: {
      label: getComponentDefinition("Text")?.label ?? "Text",
      fields: { text: { type: "textarea" } },
      defaultProps: registryProps("Text") as TextProps,
      render: ({ text }: TextProps) => <p className="poc-text">{text}</p>
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
        }
      },
      defaultProps: registryProps("Button") as ButtonProps,
      render: ({ label, variant }: ButtonProps) => (
        <button className={"poc-button poc-button--" + variant} type="button">
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
        content: {
          type: "slot",
          allow: slotAllow("Section")
        }
      },
      defaultProps: registryProps("Section") as SectionProps,
      render: ({ title, tone, content: Content }) => (
        <section className={"poc-section poc-section--" + tone}>
          <h2>{title}</h2>
          <Content className="poc-slot" />
        </section>
      )
    },
    GridBlock: {
      label: getComponentDefinition("Grid")?.label ?? "Grid",
      fields: {
        columns: { type: "number", min: 1, max: 24 },
        gap: { type: "number", min: 0, max: 96 },
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
      render: ({ columns, gap, showOverlay, content: Content }) => {
        const gridStyle = {
          "--poc-grid-columns": columns,
          "--poc-grid-gap": `${gap}px`
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
        content: { type: "slot", allow: slotAllow("Card") }
      },
      defaultProps: registryProps("Card") as CardProps,
      render: ({ title, body, span, tabletSpan, mobileSpan, content: Content, puck }) => (
        <article
          ref={puck.dragRef}
          className="poc-card"
          style={{
            gridColumn: `span ${span}`,
            "--poc-card-span-tablet": tabletSpan,
            "--poc-card-span-mobile": mobileSpan
          } as CSSProperties}
        >
          <strong>{title}</strong>
          <span className="poc-card-value">{body}</span>
          <Content className="poc-card-content poc-slot" />
        </article>
      )
    },
    ContainerBlock: {
      label: getComponentDefinition("Container")?.label ?? "Container",
      fields: {
        content: { type: "slot", allow: slotAllow("Container") }
      },
      defaultProps: registryProps("Container") as ContainerProps,
      render: ({ content: Content }) => <div className="poc-renderer-container"><Content className="poc-slot" /></div>
    },
    FlexBlock: {
      label: getComponentDefinition("Flex")?.label ?? "Flex",
      fields: {
        direction: { type: "select", options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }] },
        gap: { type: "number", min: 0, max: 64 },
        content: { type: "slot", allow: slotAllow("Flex") }
      },
      defaultProps: registryProps("Flex") as FlexProps,
      render: ({ direction, gap, content: Content }) => (
        <div className="poc-renderer-flex" style={{ display: "flex", flexDirection: direction, gap: `${gap}px` }}><Content className="poc-slot" /></div>
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
        <span>Phase 5 · grid system validation</span>
        <span>
          {validationPassed
            ? `Grid ✓ · Canvas DnD ✓ · Registry ✓ · ${componentRegistry.length} components · ${Object.keys(currentProject.nodes).length} nodes`
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
