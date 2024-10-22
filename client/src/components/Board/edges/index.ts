import type { Edge, EdgeTypes } from "@xyflow/react";
import { MarkerType, Position } from "@xyflow/react";
export const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "step",
    label: "",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    markerStart: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      stroke: "black", // 엣지의 색상을 검정색으로 설정
      strokeDasharray: "4 2",
    },
    sourceHandle: "a",
    targetHandle: "b",
  },
] satisfies Edge[];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
