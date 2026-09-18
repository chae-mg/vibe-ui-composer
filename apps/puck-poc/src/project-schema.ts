export const PROJECT_SCHEMA_VERSION = 1 as const;

export type Breakpoint = "desktop" | "tablet" | "mobile";
export type EditableBreakpoint = Exclude<Breakpoint, "desktop">;

export type GridSettings = {
  columns: number;
  gutter: number;
  margin: number;
};

export type ProjectNode = {
  id: string;
  type: string;
  children: string[];
  props: Record<string, unknown>;
  layout: { gridSpan: number };
  responsive: Partial<Record<EditableBreakpoint, { gridSpan?: number }>>;
};

export type ProjectDocument = {
  schemaVersion: typeof PROJECT_SCHEMA_VERSION;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rootId: string;
  grid: Record<Breakpoint, GridSettings>;
  theme: string;
  style: string;
  nodes: Record<string, ProjectNode>;
};

export const DEFAULT_GRID: Record<Breakpoint, GridSettings> = {
  desktop: { columns: 12, gutter: 24, margin: 32 },
  tablet: { columns: 8, gutter: 20, margin: 24 },
  mobile: { columns: 4, gutter: 16, margin: 16 }
};

export const PROJECT_NODE_TYPES = [
  "Page",
  "Section",
  "Container",
  "Flex",
  "Grid",
  "Card",
  "Text",
  "Button",
  "Input"
] as const;

export function getResponsiveGridSpan(
  node: ProjectNode,
  breakpoint: Breakpoint
): number {
  if (breakpoint === "desktop") return node.layout.gridSpan;
  return node.responsive[breakpoint]?.gridSpan ?? node.layout.gridSpan;
}

export function getGridSettings(
  project: ProjectDocument,
  breakpoint: Breakpoint
): GridSettings {
  return project.grid[breakpoint] ?? DEFAULT_GRID[breakpoint];
}

export function createDefaultProject(): ProjectDocument {
  const now = new Date().toISOString();
  const projectRoot: ProjectNode = {
    id: "project-root",
    type: "Page",
    children: ["section-1"],
    props: {},
    layout: { gridSpan: 12 },
    responsive: {}
  };
  const section: ProjectNode = {
    id: "section-1",
    type: "Section",
    children: ["grid-1"],
    props: { title: "Dashboard section", tone: "surface" },
    layout: { gridSpan: 12 },
    responsive: {}
  };
  const grid: ProjectNode = {
    id: "grid-1",
    type: "Grid",
    children: ["card-1", "card-2"],
    props: { columns: 12, gap: 16 },
    layout: { gridSpan: 12 },
    responsive: {}
  };
  const cardOne: ProjectNode = {
    id: "card-1",
    type: "Card",
    children: [],
    props: { title: "Revenue", body: "$128,430" },
    layout: { gridSpan: 6 },
    responsive: { tablet: { gridSpan: 6 }, mobile: { gridSpan: 4 } }
  };
  const cardTwo: ProjectNode = {
    id: "card-2",
    type: "Card",
    children: [],
    props: { title: "Active users", body: "8,492" },
    layout: { gridSpan: 6 },
    responsive: { tablet: { gridSpan: 6 }, mobile: { gridSpan: 4 } }
  };

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: "puck-poc-project",
    name: "Vibe Coding UI Composer",
    createdAt: now,
    updatedAt: now,
    rootId: projectRoot.id,
    grid: DEFAULT_GRID,
    theme: "clean-light",
    style: "clean",
    nodes: {
      [projectRoot.id]: projectRoot,
      [section.id]: section,
      [grid.id]: grid,
      [cardOne.id]: cardOne,
      [cardTwo.id]: cardTwo
    }
  };
}
