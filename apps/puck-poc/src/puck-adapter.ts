import type { Data } from "@puckeditor/core";
import {
  DEFAULT_GRID,
  getGridSettings,
  getResponsiveGridSpan,
  PROJECT_SCHEMA_VERSION,
  type ProjectDocument,
  type ProjectNode
} from "./project-schema";
import { getComponentDefinition } from "./component-registry";

type PuckComponentData = {
  type: string;
  props: Record<string, unknown>;
};

const PROJECT_TO_PUCK_TYPE: Record<string, string> = {
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

const PUCK_TO_PROJECT_TYPE: Record<string, string> = {
  SectionBlock: "Section",
  ContainerBlock: "Container",
  FlexBlock: "Flex",
  GridBlock: "Grid",
  CardBlock: "Card",
  HeadingBlock: "Heading",
  TextBlock: "Text",
  ButtonBlock: "Button",
  InputBlock: "Input",
  SelectBlock: "Select",
  BadgeBlock: "Badge",
  DividerBlock: "Divider",
  TableBlock: "Table"
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
    const fallbackTabletColumns = baseProject?.grid?.tablet?.columns ?? DEFAULT_GRID.tablet.columns;
    const fallbackMobileColumns = baseProject?.grid?.mobile?.columns ?? DEFAULT_GRID.mobile.columns;
    const fallbackTabletSpan = Math.min(fallbackTabletColumns, gridSpan);
    const fallbackMobileSpan = Math.min(fallbackMobileColumns, gridSpan);
    const mobileSpan = getNumber(cleanProps.smallSpan ?? cleanProps.mobileSpan, fallbackMobileSpan);
    const tabletSpan = getNumber(cleanProps.tabletSpan, fallbackTabletSpan);

    delete cleanProps.span;
    delete cleanProps.smallSpan;
    delete cleanProps.mobileSpan;
    delete cleanProps.tabletSpan;

    const responsive: ProjectNode["responsive"] = {};
    if (tabletSpan !== fallbackTabletSpan) responsive.tablet = { gridSpan: tabletSpan };
    if (mobileSpan !== fallbackMobileSpan) responsive.mobile = { gridSpan: mobileSpan };

    nodes[id] = {
      id,
      type: PUCK_TO_PROJECT_TYPE[item.type] ?? item.type,
      children,
      props: cleanProps,
      layout: { gridSpan },
      responsive
    };
    return id;
  };

  const rootId = baseProject?.rootId ?? "project-root";
  const rootProps = (data.root?.props ?? {}) as Record<string, unknown>;
  const rootChildren = Array.isArray(data.content)
    ? data.content.filter(isComponentData).map(visit)
    : [];
  const now = new Date().toISOString();

  nodes[rootId] = {
    id: rootId,
    type: "Page",
    children: rootChildren,
    props: rootProps,
    layout: { gridSpan: 12 },
    responsive: {}
  };

  const gridNode = Object.values(nodes).find((node) => node.type === "Grid");
  const gridProps = gridNode?.props ?? {};
  const baseGrid = baseProject?.grid ?? DEFAULT_GRID;
  const grid = {
    desktop: {
      ...baseGrid.desktop,
      columns: getNumber(gridProps.columns, baseGrid.desktop.columns)
    },
    tablet: {
      ...baseGrid.tablet,
      columns: getNumber(gridProps.tabletColumns, baseGrid.tablet.columns),
      gutter: getNumber(gridProps.tabletGutter, baseGrid.tablet.gutter)
    },
    mobile: {
      ...baseGrid.mobile,
      columns: getNumber(gridProps.mobileColumns, baseGrid.mobile.columns),
      gutter: getNumber(gridProps.mobileGutter, baseGrid.mobile.gutter)
    }
  };

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: baseProject?.id ?? "puck-poc-project",
    name,
    createdAt: baseProject?.createdAt ?? now,
    updatedAt: now,
    rootId,
    grid,
    theme: typeof rootProps.theme === "string" ? rootProps.theme : baseProject?.theme ?? "clean-light",
    style: typeof rootProps.style === "string" ? rootProps.style : baseProject?.style ?? "clean",
    nodes
  };
}

function nodeToPuck(
  node: ProjectNode,
  nodes: Record<string, ProjectNode>,
  project: ProjectDocument
): PuckComponentData {
  const type = PROJECT_TO_PUCK_TYPE[node.type] ?? node.type;
  const props: Record<string, unknown> = {
    ...(getComponentDefinition(node.type)?.defaultProps ?? {}),
    ...node.props,
    id: node.id
  };

  if (node.type === "Card") {
    const desktopSpan = getNumber(node.layout.gridSpan, 12);
    const tabletColumns = getNumber(getGridSettings(project, "tablet").columns, DEFAULT_GRID.tablet.columns);
    const mobileColumns = getNumber(getGridSettings(project, "mobile").columns, DEFAULT_GRID.mobile.columns);
    const tabletSpan = getNumber(node.responsive.tablet?.gridSpan, desktopSpan);
    const mobileSpan = getNumber(node.responsive.mobile?.gridSpan, desktopSpan);
    props.span = desktopSpan;
    props.tabletSpan = Math.min(tabletColumns, tabletSpan);
    props.smallSpan = Math.min(mobileColumns, mobileSpan);
  }

  if (node.type === "Grid") {
    props.tabletColumns = getGridSettings(project, "tablet").columns;
    props.mobileColumns = getGridSettings(project, "mobile").columns;
    props.tabletGutter = getGridSettings(project, "tablet").gutter;
    props.mobileGutter = getGridSettings(project, "mobile").gutter;
  }

  if (node.children.length > 0) {
    props.content = node.children
      .map((childId) => nodes[childId])
      .filter((child): child is ProjectNode => Boolean(child))
      .map((child) => nodeToPuck(child, nodes, project));
  }

  return { type, props };
}

export function projectToPuckData(project: ProjectDocument): Data {
  const root = project.nodes[project.rootId];
  if (!root) return { content: [], root: { props: { title: project.name } } };

  const content = root.children
    .map((childId) => project.nodes[childId])
    .filter((node): node is ProjectNode => Boolean(node))
    .map((node) => nodeToPuck(node, project.nodes, project));

  const rootData = {
    props: {
      ...root.props,
      title: project.name,
      gridMargin: project.grid.desktop.margin,
      tabletGridMargin: project.grid.tablet.margin,
      mobileGridMargin: project.grid.mobile.margin,
      theme: project.theme,
      style: project.style
    }
  } as Data["root"];

  return { content, root: rootData };
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
    validProject: Boolean(roundTrip.rootId && roundTrip.nodes[roundTrip.rootId]),
    nestedNodes: Boolean(root?.children.length && nestedNodeCount >= 4),
    gridSpan: gridNode?.layout.gridSpan === 12 && cardNode?.layout.gridSpan === 6,
    responsive: Boolean(cardNode && getResponsiveGridSpan(cardNode, "mobile") <= (roundTrip.grid.mobile.columns ?? 4)),
    puckContentCount: puckData.content.length
  };
}
