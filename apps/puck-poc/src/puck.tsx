import { useMemo, useState } from "react";
import { Puck as PuckEditor, type Config, type Data } from "@puckeditor/core";

const STORAGE_KEY = "ui-composer-puck-poc";

type HeadingProps = { text: string; level: "h1" | "h2" | "h3" };
type TextProps = { text: string };
type ButtonProps = { label: string; variant: "primary" | "secondary" };
type SectionProps = { title: string; tone: "surface" | "accent"; children?: React.ReactNode };

const config: Config = {
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
        }
      },
      defaultProps: { title: "Section", tone: "surface" },
      render: ({ title, tone, children }: SectionProps) => (
        <section className={"poc-section poc-section--" + tone}>
          <h2>{title}</h2>
          {children}
        </section>
      )
    }
  }
};

const defaultData: Data = {
  content: [
    {
      type: "HeadingBlock",
      props: { id: "heading-1", text: "Puck PoC", level: "h1" }
    },
    {
      type: "TextBlock",
      props: {
        id: "text-1",
        text: "Add components from the left panel and edit them in the right panel."
      }
    }
  ],
  root: { props: { title: "Vibe Coding UI Composer" } }
};

function loadData(): Data {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Data) : defaultData;
  } catch {
    return defaultData;
  }
}

export function Puck() {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const initialData = useMemo(loadData, []);

  const persist = (data: Data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSavedAt(new Date().toLocaleTimeString("ko-KR"));
  };

  return (
    <div className="poc-shell">
      <div className="poc-status" aria-live="polite">
        <span>Phase 0 · Puck validation</span>
        <span>{savedAt ? "Saved " + savedAt : "Local JSON storage ready"}</span>
      </div>
      <PuckEditor
        config={config}
        data={initialData}
        onChange={persist}
        onPublish={persist}
        headerTitle="UI Composer PoC"
        headerPath="/apps/puck-poc"
        viewports={[
          { width: 390, height: "auto", title: "Mobile" },
          { width: 768, height: "auto", title: "Tablet" },
          { width: 1440, height: "auto", title: "Desktop" }
        ]}
      />
    </div>
  );
}
