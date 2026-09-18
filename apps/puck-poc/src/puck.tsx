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
  projectToPuckData,
  puckDataToProject,
  validateProjectRoundTrip,
  type ProjectDocument
} from "./project-schema";

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
  content: Slot;
};
type CardProps = {
  title: string;
  body: string;
  span: number;
  tabletSpan: number;
  mobileSpan: number;
};

type Components = {
  HeadingBlock: HeadingProps;
  TextBlock: TextProps;
  ButtonBlock: ButtonProps;
  SectionBlock: SectionProps;
  GridBlock: GridProps;
  CardBlock: CardProps;
};

const config: Config<Components> = {
  components: {
    HeadingBlock: {
      label: "Heading",
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
      defaultProps: { text: "Build your interface", level: "h1" },
      render: ({ text, level }: HeadingProps) => {
        const Heading = level;
        return <Heading className="poc-heading">{text}</Heading>;
      }
    },
    TextBlock: {
      label: "Text",
      fields: { text: { type: "textarea" } },
      defaultProps: {
        text: "Drag a component into the canvas, select it, and edit its properties."
      },
      render: ({ text }: TextProps) => <p className="poc-text">{text}</p>
    },
    ButtonBlock: {
      label: "Button",
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
      defaultProps: { label: "Continue", variant: "primary" },
      render: ({ label, variant }: ButtonProps) => (
        <button className={"poc-button poc-button--" + variant} type="button">
          {label}
        </button>
      )
    },
    SectionBlock: {
      label: "Section",
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
          allow: ["HeadingBlock", "TextBlock", "ButtonBlock", "GridBlock"]
        }
      },
      defaultProps: { title: "Section", tone: "surface", content: [] },
      render: ({ title, tone, content: Content }: SectionProps) => (
        <section className={"poc-section poc-section--" + tone}>
          <h2>{title}</h2>
          <Content className="poc-slot" />
        </section>
      )
    },
    GridBlock: {
      label: "Grid",
      fields: {
        columns: { type: "number", min: 1, max: 12 },
        gap: { type: "number", min: 0, max: 64 },
        content: {
          type: "slot",
          allow: ["CardBlock", "HeadingBlock", "TextBlock", "ButtonBlock"]
        }
      },
      defaultProps: { columns: 12, gap: 16, content: [] },
      render: ({ columns, gap, content: Content }: GridProps) => {
        const gridStyle = {
          "--poc-grid-columns": columns,
          "--poc-grid-gap": `${gap}px`
        } as CSSProperties;

        return (
          <div className="poc-grid" style={gridStyle}>
            <div className="poc-grid-overlay" aria-hidden="true">
              {Array.from({ length: columns }, (_, index) => (
                <span key={index}>{index + 1}</span>
              ))}
            </div>
            <Content className="poc-grid-content" />
          </div>
        );
      }
    },
    CardBlock: {
      label: "Card",
      inline: true,
      fields: {
        title: { type: "text" },
        body: { type: "text" },
        span: { type: "number", min: 1, max: 12 },
        tabletSpan: { type: "number", min: 1, max: 12 },
        mobileSpan: { type: "number", min: 1, max: 12 }
      },
      defaultProps: {
        title: "Card",
        body: "Card content",
        span: 6,
        tabletSpan: 6,
        mobileSpan: 12
      },
      render: ({ title, body, span, puck }: CardProps & { puck: { dragRef: (node: HTMLElement | null) => void } }) => (
        <article
          ref={puck.dragRef}
          className="poc-card"
          style={{ gridColumn: `span ${span}` }}
        >
          <strong>{title}</strong>
          <span>{body}</span>
        </article>
      )
    }
  },
  root: {
    fields: { title: { type: "text" } },
    render: ({ title, children }: { title?: string; children: React.ReactNode }) => (
      <main className="poc-page">
        <div className="poc-page-title">{title}</div>
        {children}
      </main>
    )
  }
};

const defaultData: Data = projectToPuckData(createDefaultProject());

function loadData(): Data {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultData;
    }

    const parsed = JSON.parse(saved) as Data | { puckData?: Data };
    return "puckData" in parsed && parsed.puckData ? parsed.puckData : (parsed as Data);
  } catch {
    return defaultData;
  }
}

export function Puck() {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const initialData = useMemo(loadData, []);
  const initialProject = useMemo<ProjectDocument>(
    () => puckDataToProject(initialData),
    [initialData]
  );
  const validation = useMemo(
    () => validateProjectRoundTrip(initialProject),
    [initialProject]
  );

  const persist = (data: Data) => {
    const project = puckDataToProject(data);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ puckData: data, project })
    );
    setSavedAt(new Date().toLocaleTimeString("ko-KR"));
  };

  const validationPassed = Object.values(validation)
    .filter((value) => typeof value === "boolean")
    .every(Boolean);

  return (
    <div className="poc-shell">
      <div className="poc-status" aria-live="polite">
        <span>Phase 0 · schema / nesting validation</span>
        <span>
          {validationPassed
            ? `Schema adapter ✓ · ${Object.keys(initialProject.nodes).length} nodes`
            : "Schema adapter needs review"}
          {savedAt ? " · Saved " + savedAt : ""}
        </span>
      </div>
      <PuckEditor
        config={config}
        data={initialData}
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
