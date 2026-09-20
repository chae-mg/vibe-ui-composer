import { canAcceptChild } from "./component-registry";
import { createDefaultProject, type ProjectDocument, type ProjectNode } from "./project-schema";

export type BlockId = "sidebar-navigation" | "page-header" | "kpi-section" | "search-filter";
export type LayoutPresetId = "blank" | "sidebar-main" | "header-content";

export const BLOCK_OPTIONS: Array<{ label: string; value: BlockId; description: string }> = [
  { label: "Sidebar Navigation", value: "sidebar-navigation", description: "Navigation links in a compact sidebar" },
  { label: "Page Header", value: "page-header", description: "Title, description, and primary action" },
  { label: "KPI Section", value: "kpi-section", description: "Three dashboard metric cards" },
  { label: "Search + Filter", value: "search-filter", description: "Search input, filter select, and action" }
];

export const LAYOUT_PRESET_OPTIONS: Array<{ label: string; value: LayoutPresetId; description: string }> = [
  { label: "Blank", value: "blank", description: "An empty Page root" },
  { label: "Sidebar + Main", value: "sidebar-main", description: "A two-column dashboard starting point" },
  { label: "Header + Content", value: "header-content", description: "A page header followed by a content grid" }
];

type Fragment = { rootId: string; nodes: Record<string, ProjectNode> };

function node(
  id: string,
  type: string,
  children: string[] = [],
  props: Record<string, unknown> = {},
  gridSpan = 12
): ProjectNode {
  return { id, type, children, props, layout: { gridSpan }, responsive: {} };
}

function surfaceProps(title: string, tone: "surface" | "accent" = "surface") {
  return {
    title,
    tone,
    background: "theme.surface",
    textColor: "theme.text",
    border: "theme.border",
    radius: "radius.lg",
    shadow: "shadow.none",
    typographyRole: "heading-2"
  };
}

function cardProps(title: string, body: string) {
  return {
    title,
    body,
    background: "theme.surface",
    textColor: "theme.text",
    border: "theme.border",
    radius: "radius.md",
    shadow: "shadow.sm",
    typographyRole: "title"
  };
}

function createBlockFragment(blockId: BlockId): Fragment {
  switch (blockId) {
    case "sidebar-navigation": {
      const section = node("block-sidebar-section", "Section", ["block-sidebar-container"], surfaceProps("Sidebar Navigation"));
      const container = node("block-sidebar-container", "Container", ["block-sidebar-heading", "block-sidebar-home", "block-sidebar-analytics", "block-sidebar-settings"], {
        direction: "column",
        wrap: "nowrap",
        align: "stretch",
        justify: "start",
        gap: "space.8",
        padding: "space.16",
        heightMode: "auto",
        height: 240
      }, 3);
      return {
        rootId: section.id,
        nodes: {
          [section.id]: section,
          [container.id]: container,
          "block-sidebar-heading": node("block-sidebar-heading", "Heading", [], { text: "Workspace", level: "h3", typographyRole: "heading-3" }),
          "block-sidebar-home": node("block-sidebar-home", "Button", [], { label: "Overview", variant: "secondary", typographyRole: "body" }),
          "block-sidebar-analytics": node("block-sidebar-analytics", "Button", [], { label: "Analytics", variant: "secondary", typographyRole: "body" }),
          "block-sidebar-settings": node("block-sidebar-settings", "Button", [], { label: "Settings", variant: "secondary", typographyRole: "body" })
        }
      };
    }
    case "page-header": {
      const section = node("block-header-section", "Section", ["block-header-container"], surfaceProps("Page Header", "accent"));
      const container = node("block-header-container", "Container", ["block-header-title", "block-header-description", "block-header-action"], {
        direction: "column",
        wrap: "nowrap",
        align: "start",
        justify: "start",
        gap: "space.8",
        padding: "space.16",
        heightMode: "auto",
        height: 180
      });
      return {
        rootId: section.id,
        nodes: {
          [section.id]: section,
          [container.id]: container,
          "block-header-title": node("block-header-title", "Heading", [], { text: "Dashboard", level: "h1", typographyRole: "heading-1" }),
          "block-header-description": node("block-header-description", "Text", [], { text: "Track the metrics that matter to your team.", typographyRole: "body-large" }),
          "block-header-action": node("block-header-action", "Button", [], { label: "Create report", variant: "primary", typographyRole: "body" })
        }
      };
    }
    case "kpi-section": {
      const section = node("block-kpi-section", "Section", ["block-kpi-grid"], surfaceProps("KPI Section"));
      const grid = node("block-kpi-grid", "Grid", ["block-kpi-revenue", "block-kpi-users", "block-kpi-conversion"], {
        columns: 12,
        gap: "space.16",
        padding: "space.16",
        align: "stretch",
        justify: "stretch",
        heightMode: "auto",
        height: 180,
        showOverlay: true
      });
      return {
        rootId: section.id,
        nodes: {
          [section.id]: section,
          [grid.id]: grid,
          "block-kpi-revenue": node("block-kpi-revenue", "Card", [], cardProps("Revenue", "$128,430"), 4),
          "block-kpi-users": node("block-kpi-users", "Card", [], cardProps("Active users", "8,492"), 4),
          "block-kpi-conversion": node("block-kpi-conversion", "Card", [], cardProps("Conversion", "14.8%"), 4)
        }
      };
    }
    case "search-filter": {
      const section = node("block-search-section", "Section", ["block-search-flex"], surfaceProps("Search + Filter"));
      const flex = node("block-search-flex", "Flex", ["block-search-input", "block-search-select", "block-search-action"], {
        direction: "row",
        wrap: "wrap",
        align: "end",
        justify: "start",
        gap: "space.8",
        padding: "space.16",
        heightMode: "auto",
        height: 100
      });
      return {
        rootId: section.id,
        nodes: {
          [section.id]: section,
          [flex.id]: flex,
          "block-search-input": node("block-search-input", "Input", [], { label: "Search", placeholder: "Search records", inputType: "text" }, 5),
          "block-search-select": node("block-search-select", "Select", [], { label: "Status", options: "All\nActive\nArchived" }, 3),
          "block-search-action": node("block-search-action", "Button", [], { label: "Apply filters", variant: "primary", typographyRole: "body" }, 2)
        }
      };
    }
  }
}

function blankProject(baseProject?: ProjectDocument): ProjectDocument {
  const seed = createDefaultProject();
  const now = new Date().toISOString();
  return {
    ...seed,
    id: baseProject?.id ?? seed.id,
    name: baseProject?.name ?? seed.name,
    createdAt: baseProject?.createdAt ?? seed.createdAt,
    updatedAt: now,
    grid: baseProject?.grid ?? seed.grid,
    theme: baseProject?.theme ?? seed.theme,
    style: baseProject?.style ?? seed.style,
    rootId: "project-root",
    nodes: {
      "project-root": node("project-root", "Page", [], { title: baseProject?.name ?? seed.name })
    }
  };
}

function uniqueId(baseId: string, used: Set<string>) {
  let candidate = baseId;
  let suffix = 2;
  while (used.has(candidate)) candidate = `${baseId}-${suffix++}`;
  used.add(candidate);
  return candidate;
}

export function insertBlock(project: ProjectDocument, blockId: BlockId, parentId = project.rootId): ProjectDocument {
  const parent = project.nodes[parentId];
  if (!parent) return project;

  const fragment = createBlockFragment(blockId);
  const fragmentRoot = fragment.nodes[fragment.rootId];
  if (!fragmentRoot || !canAcceptChild(parent.type, fragmentRoot.type)) return project;

  const nodes = { ...project.nodes };
  const used = new Set(Object.keys(nodes));
  const idMap = new Map<string, string>();
  Object.keys(fragment.nodes).forEach((id) => idMap.set(id, uniqueId(id, used)));

  Object.values(fragment.nodes).forEach((source) => {
    const id = idMap.get(source.id) as string;
    nodes[id] = {
      ...source,
      id,
      children: source.children.map((childId) => idMap.get(childId) as string),
      props: { ...source.props },
      responsive: { ...source.responsive }
    };
  });

  const insertedRootId = idMap.get(fragment.rootId) as string;
  nodes[parent.id] = { ...parent, children: [...parent.children, insertedRootId] };
  return { ...project, updatedAt: new Date().toISOString(), nodes };
}

function layoutPresetProject(project: ProjectDocument, presetId: LayoutPresetId): ProjectDocument {
  const next = blankProject(project);
  if (presetId === "blank") return next;

  if (presetId === "sidebar-main") {
    const section = node("layout-sidebar-main-section", "Section", ["layout-sidebar-main-grid"], surfaceProps("Sidebar + Main"));
    const grid = node("layout-sidebar-main-grid", "Grid", ["layout-sidebar-card", "layout-main-card"], {
      columns: 12,
      gap: "space.16",
      padding: "space.16",
      align: "stretch",
      justify: "stretch",
      heightMode: "auto",
      height: 360,
      showOverlay: true
    });
    next.nodes = {
      ...next.nodes,
      [section.id]: section,
      [grid.id]: grid,
      "layout-sidebar-card": node("layout-sidebar-card", "Card", ["layout-sidebar-title", "layout-sidebar-links"], cardProps("Sidebar", "Navigation"), 3),
      "layout-sidebar-title": node("layout-sidebar-title", "Heading", [], { text: "Workspace", level: "h3", typographyRole: "heading-3" }),
      "layout-sidebar-links": node("layout-sidebar-links", "Text", [], { text: "Overview\nAnalytics\nSettings", typographyRole: "body" }),
      "layout-main-card": node("layout-main-card", "Card", ["layout-main-title", "layout-main-copy"], cardProps("Main content", "Start building your dashboard"), 9),
      "layout-main-title": node("layout-main-title", "Heading", [], { text: "Welcome back", level: "h2", typographyRole: "heading-2" }),
      "layout-main-copy": node("layout-main-copy", "Text", [], { text: "Use the Block Library to add common UI patterns.", typographyRole: "body" })
    };
    next.nodes[next.rootId] = { ...next.nodes[next.rootId], children: [section.id] };
    return { ...next, updatedAt: new Date().toISOString() };
  }

  const header = node("layout-header-section", "Section", ["layout-header-container"], surfaceProps("Header + Content", "accent"));
  const headerContainer = node("layout-header-container", "Container", ["layout-header-title", "layout-header-copy"], {
    direction: "column",
    wrap: "nowrap",
    align: "start",
    justify: "start",
    gap: "space.8",
    padding: "space.16",
    heightMode: "auto",
    height: 160
  });
  const content = node("layout-content-section", "Section", ["layout-content-grid"], surfaceProps("Content"));
  const contentGrid = node("layout-content-grid", "Grid", ["layout-content-card-one", "layout-content-card-two"], {
    columns: 12,
    gap: "space.16",
    padding: "space.16",
    align: "stretch",
    justify: "stretch",
    heightMode: "auto",
    height: 260,
    showOverlay: true
  });
  next.nodes = {
    ...next.nodes,
    [header.id]: header,
    [headerContainer.id]: headerContainer,
    "layout-header-title": node("layout-header-title", "Heading", [], { text: "Content overview", level: "h1", typographyRole: "heading-1" }),
    "layout-header-copy": node("layout-header-copy", "Text", [], { text: "A clean starting point for a new page.", typographyRole: "body-large" }),
    [content.id]: content,
    [contentGrid.id]: contentGrid,
    "layout-content-card-one": node("layout-content-card-one", "Card", [], cardProps("Primary content", "Add a block to continue"), 6),
    "layout-content-card-two": node("layout-content-card-two", "Card", [], cardProps("Secondary content", "Your next section goes here"), 6)
  };
  next.nodes[next.rootId] = { ...next.nodes[next.rootId], children: [header.id, content.id] };
  return { ...next, updatedAt: new Date().toISOString() };
}

export function applyLayoutPreset(project: ProjectDocument, presetId: LayoutPresetId): ProjectDocument {
  return layoutPresetProject(project, presetId);
}
