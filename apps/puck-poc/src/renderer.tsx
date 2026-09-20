import type { CSSProperties, ReactNode } from "react";
import {
  getGridSettings,
  getResponsiveGridSpan,
  type Breakpoint,
  type ProjectDocument,
  type ProjectNode
} from "./project-schema";
import { getComponentDefinition } from "./component-registry";
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
import { getTypographyStyle, resolveSpacing } from "./design-tokens";

export type ProjectRendererProps = {
  project: ProjectDocument;
  breakpoint?: Breakpoint;
  showGridOverlay?: boolean;
};

type NodeViewProps = {
  project: ProjectDocument;
  nodeId: string;
  breakpoint: Breakpoint;
  showGridOverlay: boolean;
  trail: string[];
};

function stringProp(
  node: ProjectNode,
  key: string,
  fallback: string
): string {
  const value = node.props[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function numberProp(node: ProjectNode, key: string, fallback: number): number {
  const value = node.props[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function layoutStyleProps(node: ProjectNode) {
  return {
    direction: stringProp(node, "direction", "column") as LayoutDirection,
    wrap: stringProp(node, "wrap", "nowrap") as LayoutWrap,
    align: stringProp(node, "align", "stretch") as LayoutAlign,
    justify: stringProp(node, "justify", "start") as LayoutJustify,
    gap: resolveSpacing(node.props.gap, 16),
    padding: resolveSpacing(node.props.padding, 0),
    heightMode: stringProp(node, "heightMode", "auto") as LayoutHeightMode,
    height: numberProp(node, "height", 240)
  };
}

function childViews({ project, node, breakpoint, showGridOverlay, trail }: {
  project: ProjectDocument;
  node: ProjectNode;
  breakpoint: Breakpoint;
  showGridOverlay: boolean;
  trail: string[];
}): ReactNode[] {
  return node.children.map((childId) => (
    <NodeView
      key={childId}
      project={project}
      nodeId={childId}
      breakpoint={breakpoint}
      showGridOverlay={showGridOverlay}
      trail={trail}
    />
  ));
}

function NodeView({
  project,
  nodeId,
  breakpoint,
  showGridOverlay,
  trail
}: NodeViewProps) {
  const node = project.nodes[nodeId];
  if (!node) return null;

  const definition = getComponentDefinition(node.type);
  if (!definition) {
    return (
      <div className="poc-unknown-node" data-schema-node={node.id}>
        Unsupported node type: {node.type}
      </div>
    );
  }

  if (trail.includes(nodeId)) {
    return (
      <div className="poc-unknown-node" data-schema-node={nodeId}>
        Circular node reference ignored
      </div>
    );
  }

  const nextTrail = [...trail, nodeId];
  const children = childViews({
    project,
    node,
    breakpoint,
    showGridOverlay,
    trail: nextTrail
  });

  switch (node.type) {
    case "Page":
      return (
        <main
          className="poc-page poc-renderer-page"
          style={{ "--poc-page-margin": `${getGridSettings(project, breakpoint).margin}px` } as CSSProperties}
          data-schema-node={node.id}
        >
          <div className="poc-page-title">
            {stringProp(node, "title", project.name)}
          </div>
          {children}
        </main>
      );
    case "Section": {
      const tone = stringProp(node, "tone", "surface");
      return (
        <section
          className={`poc-section poc-section--${tone}`}
          style={getAppearanceStyle({
            background: stringProp(node, "background", ""),
            textColor: stringProp(node, "textColor", ""),
            border: stringProp(node, "border", ""),
            radius: node.props.radius as number | string,
            shadow: stringProp(node, "shadow", "none") as AppearanceShadow
          }) as CSSProperties}
          data-schema-node={node.id}
        >
          <h2 style={getTypographyStyle(node.props.typographyRole, "heading-2") as CSSProperties}>{stringProp(node, "title", "Section")}</h2>
          <div className="poc-slot">{children}</div>
        </section>
      );
    }
    case "Heading": {
      const level = stringProp(node, "level", "h2");
      const Heading = level === "h1" || level === "h3" ? level : "h2";
      return <Heading className="poc-heading" style={getTypographyStyle(node.props.typographyRole, level === "h1" ? "heading-1" : level === "h3" ? "heading-3" : "heading-2") as CSSProperties} data-schema-node={node.id}>{stringProp(node, "text", definition.label)}</Heading>;
    }
    case "Container":
      return <div className="poc-renderer-container" style={getFlexLayoutStyle({ ...layoutStyleProps(node), padding: resolveSpacing(node.props.padding, 16) }) as CSSProperties} data-schema-node={node.id}>{children}</div>;
    case "Flex": {
      const style = getFlexLayoutStyle({ ...layoutStyleProps(node), direction: stringProp(node, "direction", "row") as LayoutDirection }) as CSSProperties;
      return <div className="poc-renderer-flex" style={style} data-schema-node={node.id}>{children}</div>;
    }
    case "Grid": {
      const grid = getGridSettings(project, breakpoint);
      const columns = Math.max(1, numberProp(node, "columns", grid.columns));
      const gap = Math.max(0, resolveSpacing(node.props.gap, grid.gutter));
      const padding = resolveSpacing(node.props.padding, 16);
      const gridStyle = {
        ...getGridLayoutStyle({
          columns,
          gap,
          padding,
          align: stringProp(node, "align", "stretch") as LayoutAlign,
          justify: stringProp(node, "justify", "stretch") as LayoutJustify,
          heightMode: stringProp(node, "heightMode", "auto") as LayoutHeightMode,
          height: numberProp(node, "height", 240)
        }),
        "--poc-grid-columns": columns,
        "--poc-grid-gap": `${gap}px`,
        "--poc-grid-padding": `${padding}px`
      } as CSSProperties;
      return (
        <div className="poc-grid poc-renderer-grid" style={gridStyle} data-schema-node={node.id}>
          {showGridOverlay ? (
            <div className="poc-grid-overlay" aria-hidden="true">
              {Array.from({ length: columns }, (_, index) => <span key={index}>{index + 1}</span>)}
            </div>
          ) : null}
          <div className="poc-grid-content">{children}</div>
        </div>
      );
    }
    case "Card": {
      const grid = getGridSettings(project, breakpoint);
      const span = Math.min(grid.columns, Math.max(1, getResponsiveGridSpan(node, breakpoint)));
      return (
        <article className="poc-card" style={{ gridColumn: `span ${span}`, ...getAppearanceStyle({
          background: stringProp(node, "background", ""),
          textColor: stringProp(node, "textColor", ""),
          border: stringProp(node, "border", ""),
          radius: node.props.radius as number | string,
          shadow: stringProp(node, "shadow", "sm") as AppearanceShadow
        }) }} data-schema-node={node.id}>
          <strong style={getTypographyStyle(node.props.typographyRole, "title") as CSSProperties}>{stringProp(node, "title", "Card")}</strong>
          <span className="poc-card-value" style={getTypographyStyle(node.props.typographyRole, "body") as CSSProperties}>{stringProp(node, "body", "Card content")}</span>
          <div className="poc-card-content poc-slot">{children}</div>
        </article>
      );
    }
    case "Text":
      return <p className="poc-text" style={getTypographyStyle(node.props.typographyRole, "body") as CSSProperties} data-schema-node={node.id}>{stringProp(node, "text", "Text")}</p>;
    case "Button":
      return <button className={`poc-button poc-button--${stringProp(node, "variant", "primary")}`} style={getTypographyStyle(node.props.typographyRole, "body") as CSSProperties} type="button" data-schema-node={node.id}>{stringProp(node, "label", "Button")}</button>;
    case "Input":
      return <input className="poc-input" placeholder={stringProp(node, "placeholder", "Input")} aria-label={stringProp(node, "label", "Input")} data-schema-node={node.id} />;
    case "Select":
      return (
        <label className="poc-field" data-schema-node={node.id}>
          <span>{stringProp(node, "label", "Select")}</span>
          <select className="poc-input" defaultValue="0">
            {stringProp(node, "options", "Option 1\nOption 2").split("\n").filter(Boolean).map((option, index) => <option key={option} value={String(index)}>{option}</option>)}
          </select>
        </label>
      );
    case "Badge":
      return <span className={`poc-badge poc-badge--${stringProp(node, "tone", "neutral")}`} data-schema-node={node.id}>{stringProp(node, "text", "Badge")}</span>;
    case "Divider":
      return <div className={`poc-divider poc-divider--${stringProp(node, "orientation", "horizontal")}`} role="separator" data-schema-node={node.id} />;
    case "Table": {
      const columns = stringProp(node, "columns", "Name\nStatus\nUpdated").split("\n").filter(Boolean);
      return (
        <div className="poc-table-wrap" data-schema-node={node.id}>
          <strong>{stringProp(node, "title", "Table")}</strong>
          <table className="poc-table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody><tr>{columns.map((column) => <td key={column}>—</td>)}</tr></tbody></table>
        </div>
      );
    }
    default:
      return (
        <div className="poc-unknown-node" data-schema-node={node.id}>
          Unsupported node type: {definition.label}
          {children}
        </div>
      );
  }
}

export function ProjectRenderer({
  project,
  breakpoint = "desktop",
  showGridOverlay = true
}: ProjectRendererProps) {
  const root = project.nodes[project.rootId];
  if (!root) {
    return <div className="poc-unknown-node">Project root is missing</div>;
  }

  return (
    <div className="poc-renderer" data-schema-version={project.schemaVersion} data-breakpoint={breakpoint}>
      <NodeView
        project={project}
        nodeId={root.id}
        breakpoint={breakpoint}
        showGridOverlay={showGridOverlay}
        trail={[]}
      />
    </div>
  );
}
