import { canAcceptChild, getComponentDefinition } from "./component-registry";
import type { Breakpoint, GridSettings, ProjectDocument, ProjectNode } from "./project-schema";
import { spacingTokenFor } from "./design-tokens";

function touch(project: ProjectDocument, nodes: Record<string, ProjectNode>): ProjectDocument {
  return { ...project, updatedAt: new Date().toISOString(), nodes };
}

function cloneNode(node: ProjectNode, nodes: Record<string, ProjectNode>, used: Set<string>): string {
  let suffix = 1;
  let id = `${node.id}-copy`;
  while (used.has(id)) id = `${node.id}-copy-${suffix++}`;
  used.add(id);

  const children = node.children
    .map((childId) => nodes[childId])
    .filter((child): child is ProjectNode => Boolean(child))
    .map((child) => cloneNode(child, nodes, used));

  nodes[id] = { ...node, id, locked: false, children, props: { ...node.props }, responsive: { ...node.responsive } };
  return id;
}

export function canInsertChild(
  project: ProjectDocument,
  parentId: string,
  childType: string
): boolean {
  const parent = project.nodes[parentId];
  return Boolean(parent && getComponentDefinition(childType) && canAcceptChild(parent.type, childType));
}

export function duplicateSubtree(project: ProjectDocument, nodeId: string): ProjectDocument {
  const source = project.nodes[nodeId];
  if (!source) return project;

  const parent = Object.values(project.nodes).find((node) => node.children.includes(nodeId));
  if (!parent || parent.locked || source.locked || !canInsertChild(project, parent.id, source.type)) return project;

  const nodes = { ...project.nodes };
  const used = new Set(Object.keys(nodes));
  const duplicateId = cloneNode(source, nodes, used);
  const index = parent.children.indexOf(nodeId);
  nodes[parent.id] = {
    ...parent,
    children: [...parent.children.slice(0, index + 1), duplicateId, ...parent.children.slice(index + 1)]
  };
  return touch(project, nodes);
}

export function removeSubtree(project: ProjectDocument, nodeId: string): ProjectDocument {
  if (nodeId === project.rootId || !project.nodes[nodeId]) return project;
  const nodes = { ...project.nodes };
  const parent = Object.values(nodes).find((node) => node.children.includes(nodeId));
  if (!parent || parent.locked || nodes[nodeId].locked) return project;

  const remove = (id: string) => {
    const node = nodes[id];
    if (!node) return;
    node.children.forEach(remove);
    delete nodes[id];
  };
  remove(nodeId);
  nodes[parent.id] = { ...parent, children: parent.children.filter((childId) => childId !== nodeId) };
  return touch(project, nodes);
}

export function setNodeLocked(project: ProjectDocument, nodeId: string, locked: boolean): ProjectDocument {
  const node = project.nodes[nodeId];
  if (!node || nodeId === project.rootId) return project;
  return touch(project, { ...project.nodes, [nodeId]: { ...node, locked } });
}

export function reorderChildren(
  project: ProjectDocument,
  parentId: string,
  fromIndex: number,
  toIndex: number
): ProjectDocument {
  const parent = project.nodes[parentId];
  if (!parent || fromIndex < 0 || toIndex < 0 || fromIndex >= parent.children.length || toIndex >= parent.children.length) {
    return project;
  }
  const children = [...parent.children];
  const [moved] = children.splice(fromIndex, 1);
  children.splice(toIndex, 0, moved);
  return touch(project, { ...project.nodes, [parentId]: { ...parent, children } });
}

export const GRID_COLUMN_PRESETS = [4, 6, 8, 12, 16] as const;

export function clampGridSpan(
  value: number,
  columns: number,
  minSpan = 1,
  maxSpan = columns
): number {
  const safeValue = Number.isFinite(value) ? Math.round(value) : minSpan;
  const safeColumns = Math.max(1, Math.round(columns));
  const lowerBound = Math.max(1, Math.round(minSpan));
  const upperBound = Math.max(lowerBound, Math.min(safeColumns, Math.round(maxSpan)));
  return Math.min(upperBound, Math.max(lowerBound, safeValue));
}

function normalizeGridSettings(settings: GridSettings): GridSettings {
  return {
    columns: Math.min(24, Math.max(1, Math.round(settings.columns))),
    gutter: Math.min(96, Math.max(0, Math.round(settings.gutter))),
    margin: Math.min(128, Math.max(0, Math.round(settings.margin)))
  };
}

export function updateGridSettings(
  project: ProjectDocument,
  breakpoint: Breakpoint,
  patch: Partial<GridSettings>
): ProjectDocument {
  const nextGrid = normalizeGridSettings({ ...project.grid[breakpoint], ...patch });
  let nodes = project.nodes;

  if (breakpoint === "desktop") {
    nodes = Object.fromEntries(
      Object.entries(project.nodes).map(([id, node]) => {
        const definition = getComponentDefinition(node.type);
        const span = definition
          ? clampGridSpan(
              node.layout.gridSpan,
              nextGrid.columns,
              definition.resizeRules.minSpan,
              definition.resizeRules.maxSpan
            )
          : clampGridSpan(node.layout.gridSpan, nextGrid.columns);
        const props = node.type === "Grid"
          ? { ...node.props, columns: nextGrid.columns, gap: spacingTokenFor(nextGrid.gutter) }
          : node.props;
        return [id, { ...node, props, layout: { ...node.layout, gridSpan: span } }];
      })
    );
  }

  return {
    ...project,
    grid: { ...project.grid, [breakpoint]: nextGrid },
    nodes,
    updatedAt: new Date().toISOString()
  };
}

export function setGridOverlay(project: ProjectDocument, visible: boolean): ProjectDocument {
  const nodes = Object.fromEntries(
    Object.entries(project.nodes).map(([id, node]) => [
      id,
      node.type === "Grid" ? { ...node, props: { ...node.props, showOverlay: visible } } : node
    ])
  );
  return { ...project, nodes, updatedAt: new Date().toISOString() };
}

export type ProjectTreeIssue = { nodeId: string; message: string };

export function validateProjectTree(project: ProjectDocument): ProjectTreeIssue[] {
  const issues: ProjectTreeIssue[] = [];
  const root = project.nodes[project.rootId];
  if (!root) return [{ nodeId: project.rootId, message: "Project root is missing" }];

  const visit = (node: ProjectNode, trail: Set<string>) => {
    if (trail.has(node.id)) {
      issues.push({ nodeId: node.id, message: "Circular child reference" });
      return;
    }
    const nextTrail = new Set(trail).add(node.id);
    node.children.forEach((childId) => {
      const child = project.nodes[childId];
      if (!child) {
        issues.push({ nodeId: node.id, message: `Missing child: ${childId}` });
        return;
      }
      if (!canAcceptChild(node.type, child.type)) {
        issues.push({ nodeId: child.id, message: `${child.type} is not allowed inside ${node.type}` });
      }
      visit(child, nextTrail);
    });
  };

  visit(root, new Set());
  return issues;
}
