import type { CSSProperties, ReactNode } from "react";
import {
  getGridSettings,
  getResponsiveGridSpan,
  type Breakpoint,
  type ProjectDocument,
  type ProjectNode
} from "./project-schema";

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
        <main className="poc-page poc-renderer-page" data-schema-node={node.id}>
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
          data-schema-node={node.id}
        >
          <h2>{stringProp(node, "title", "Section")}</h2>
          <div className="poc-slot">{children}</div>
        </section>
      );
    }
    case "Container":
      return <div className="poc-renderer-container" data-schema-node={node.id}>{children}</div>;
    case "Flex": {
      const direction = stringProp(node, "direction", "row");
      const style = {
        display: "flex",
        flexDirection: direction === "column" ? "column" : "row",
        gap: `${numberProp(node, "gap", 16)}px`
      } as CSSProperties;
      return <div className="poc-renderer-flex" style={style} data-schema-node={node.id}>{children}</div>;
    }
    case "Grid": {
      const grid = getGridSettings(project, breakpoint);
      const columns = Math.max(1, numberProp(node, "columns", grid.columns));
      const gap = Math.max(0, numberProp(node, "gap", grid.gutter));
      const gridStyle = {
        "--poc-grid-columns": columns,
        "--poc-grid-gap": `${gap}px`
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
        <article className="poc-card" style={{ gridColumn: `span ${span}` }} data-schema-node={node.id}>
          <strong>{stringProp(node, "title", "Card")}</strong>
          <span>{stringProp(node, "body", "Card content")}</span>
          {children}
        </article>
      );
    }
    case "Text":
      return <p className="poc-text" data-schema-node={node.id}>{stringProp(node, "text", "Text")}</p>;
    case "Button":
      return <button className={`poc-button poc-button--${stringProp(node, "variant", "primary")}`} type="button" data-schema-node={node.id}>{stringProp(node, "label", "Button")}</button>;
    case "Input":
      return <input className="poc-input" placeholder={stringProp(node, "placeholder", "Input")} aria-label={stringProp(node, "label", "Input")} data-schema-node={node.id} />;
    default:
      return (
        <div className="poc-unknown-node" data-schema-node={node.id}>
          Unsupported node type: {node.type}
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
