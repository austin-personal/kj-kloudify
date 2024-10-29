import type { Edge, EdgeTypes } from "@xyflow/react";
import { MarkerType} from "@xyflow/react";
export const initialEdges = [
  // {
  //   id: "e1-2",
  //   source: "1",
  //   target: "2",
  //   type: "step",
  //   label: "",
  //   markerEnd: {
  //     type: MarkerType.ArrowClosed,
  //   },
  //   markerStart: {
  //     type: MarkerType.ArrowClosed,
  //   },
  //   style: {
  //     stroke: "black", // 엣지의 색상을 검정색으로 설정
  //     strokeDasharray: "4 2",
  //   },
  //   sourceHandle: "a",
  //   targetHandle: "b",
  // },
] satisfies Edge[];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;

// 새로운 엣지를 추가하는 함수
export const addConnectEdge = (
  sourceNodeId: string,
  targetNodeId: string,
  edges: Edge[],
): Edge[] => {
  const newEdge: Edge<any> = {
    id: `${sourceNodeId}-${targetNodeId}`,  // 엣지의 고유 ID
    source: sourceNodeId,  // 시작 노드의 ID
    target: targetNodeId,  // 연결할 대상 노드의 ID
    type: "step", 
    animated: true, // 엣지 타입 지정
    markerEnd: {
      type: MarkerType.ArrowClosed,  // 화살표 끝 표시
    },
    markerStart: {
      type: MarkerType.ArrowClosed,  // 화살표 시작 표시
    },
    style: {
      stroke: "black",  // 엣지의 색상 설정
      strokeDasharray: "4 2",  // 대시된 선
    },
    sourceHandle: "a",  // 시작 핸들
    targetHandle: "b",  // 타겟 핸들
  };

  // 기존 엣지 배열에 새로운 엣지를 추가하고 반환
  return [...edges, newEdge];
};