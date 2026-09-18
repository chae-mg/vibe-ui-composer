import { canAcceptChild, getComponentDefinition } from "./component-registry";
import type { ProjectDocument, ProjectNode } from "./project-schema";

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

  nodes[id] = { ...node, id, children, props: { ...node.props }, responsive: { ...node.responsive } };
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
  if (!parent || !canInsertChild(project, parent.id, source.type)) return project;

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
  if (!parent) return project;

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
