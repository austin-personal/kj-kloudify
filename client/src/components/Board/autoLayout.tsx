import dagre from "dagre";
import { Node, Edge, Position, BuiltInNode } from "@xyflow/react";

export type PositionLoggerNode = Node<
  {
    label?: string;
    imgUrl?: string;
    description?: string;
  },
  "position-logger"
>;

// `dagre` 그래프 설정
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 50;
const nodeHeight = 50;

export type AppNode = BuiltInNode | PositionLoggerNode;

export const getLayoutedElements = (nodes: AppNode[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: "TB" }); // TB: Top-Bottom 방향, 다른 옵션으로 LR (Left-Right) 가능

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    // 타입 좁히기 적용
    const data =
      "imgUrl" in node.data && "description" in node.data
        ? {
            label: node.data.label || "",
            imgUrl: node.data.imgUrl || "",
            description: node.data.description || "",
          }
        : { label: node.data.label || "" };

    return {
      ...node,
      type: "position-logger" as const,
      data,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
