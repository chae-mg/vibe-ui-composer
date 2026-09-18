import type { Data } from "@puckeditor/core";
import {
  DEFAULT_GRID,
  PROJECT_SCHEMA_VERSION,
  type ProjectDocument,
  type ProjectNode
} from "./project-schema";

type PuckComponentData = {
  type: string;
  props: Record<string, unknown>;
};

const PROJECT_TO_PUCK_TYPE: Record<string, string> = {
  Section: "SectionBlock",
  Grid: "GridBlock",
  Card: "CardBlock",
  Heading: "HeadingBlock",
  Text: "TextBlock",
  Button: "ButtonBlock",
  Input: "InputBlock"
};

const PUCK_TO_PROJECT_TYPE: Record<string, string> = {
  SectionBlock: "Section",
  GridBlock: "Grid",
  CardBlock: "Card",
  HeadingBlock: "Heading",
  TextBlock: "Text",
  ButtonBlock: "Button",
  InputBlock: "Input"
};

function isComponentData(value: unknown): value is PuckComponentData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      typeof (value as { type?: unknown }).type === "string"
  );
}

function getNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function collectSlotChildren(
  props: Record<string, unknown>,
  visit: (item: PuckComponentData) => string
): { children: string[]; cleanProps: Record<string, unknown> } {
  const children: string[] = [];
  const cleanProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (Array.isArray(value) && value.every(isComponentData)) {
      children.push(...value.map(visit));
      continue;
    }
    if (key !== "id") cleanProps[key] = value;
  }

  return { children, cleanProps };
}

export function puckDataToProject(
  data: Data,
  name = "Puck PoC Project",
  baseProject?: ProjectDocument
): ProjectDocument {
  const nodes: Record<string, ProjectNode> = {};
  let generatedId = 0;

  const visit = (item: PuckComponentData): string => {
    const props = item.props ?? {};
    const id =
      typeof props.id === "string" && props.id.length > 0
        ? props.id
        : `generated-${generatedId++}`;
    const { children, cleanProps } = collectSlotChildren(props, visit);
    const gridSpan = getNumber(cleanProps.span, 12);
    const mobileSpan = getNumber(cleanProps.mobileSpan, gridSpan);
    const tabletSpan = getNumber(cleanProps.tabletSpan, gridSpan);

    delete cleanProps.span;
    delete cleanProps.mobileSpan;
    delete cleanProps.tabletSpan;

    nodes[id] = {
      id,
      type: PUCK_TO_PROJECT_TYPE[item.type] ?? item.type,
      children,
      props: cleanProps,
      layout: { gridSpan },
      responsive: {
        tablet: { gridSpan: tabletSpan },
        mobile: { gridSpan: mobileSpan }
      }
    };
    return id;
  };

  const rootId = baseProject?.rootId ?? "project-root";
  const rootChildren = Array.isArray(data.content)
    ? data.content.filter(isComponentData).map(visit)
    : [];
  const now = new Date().toISOString();

  nodes[rootId] = {
    id: rootId,
    type: "Page",
    children: rootChildren,
    props: data.root?.props ?? {},
    layout: { gridSpan: 12 },
    responsive: {}
  };

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: baseProject?.id ?? "puck-poc-project",
    name,
    createdAt: baseProject?.createdAt ?? now,
    updatedAt: now,
    rootId,
    grid: baseProject?.grid ?? DEFAULT_GRID,
    theme: baseProject?.theme ?? "clean-light",
    style: baseProject?.style ?? "clean",
    nodes
  };
}

function nodeToPuck(
  node: ProjectNode,
  nodes: Record<string, ProjectNode>
): PuckComponentData {
  const type = PROJECT_TO_PUCK_TYPE[node.type] ?? node.type;
  const props: Record<string, unknown> = { ...node.props, id: node.id };

  if (node.type === "Card") {
    props.span = node.layout.gridSpan;
    props.tabletSpan = node.responsive.tablet?.gridSpan ?? node.layout.gridSpan;
    props.mobileSpan = node.responsive.mobile?.gridSpan ?? node.layout.gridSpan;
  }

  if (node.children.length > 0) {
    props.content = node.children
      .map((childId) => nodes[childId])
      .filter((child): child is ProjectNode => Boolean(child))
      .map((child) => nodeToPuck(child, nodes));
  }

  return { type, props };
}

export function projectToPuckData(project: ProjectDocument): Data {
  const root = project.nodes[project.rootId];
  if (!root) return { content: [], root: { props: { title: project.name } } };

  const content = root.children
    .map((childId) => project.nodes[childId])
    .filter((node): node is ProjectNode => Boolean(node))
    .map((node) => nodeToPuck(node, project.nodes));

  return {
    content,
    root: { props: { ...root.props, title: project.name } }
  };
}

export function validateProjectRoundTrip(project: ProjectDocument) {
  const puckData = projectToPuckData(project);
  const roundTrip = puckDataToProject(puckData, project.name, project);
  const root = roundTrip.nodes[roundTrip.rootId];
  const nestedNodeCount = Object.keys(roundTrip.nodes).length - 1;
  const gridNode = Object.values(roundTrip.nodes).find((node) => node.type === "Grid");
  const cardNode = Object.values(roundTrip.nodes).find((node) => node.type === "Card");

  return {
    schemaVersion: roundTrip.schemaVersion === PROJECT_SCHEMA_VERSION,
    nestedNodes: Boolean(root?.children.length && nestedNodeCount >= 4),
    gridSpan: gridNode?.layout.gridSpan === 12 && cardNode?.layout.gridSpan === 6,
    responsive: cardNode?.responsive.mobile?.gridSpan === 4,
    puckContentCount: puckData.content.length
  };
}
