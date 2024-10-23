import type { Node, NodeTypes, BuiltInNode } from "@xyflow/react";
import { PositionLoggerNode } from "./PositionLoggerNode";
// import { Handle, Position } from '@xyflow/react';
export type PositionLoggerNode = Node<
  {
    label?: string;
    imgUrl? :string;
    description? :string;
  },
  "position-logger"
>;

export type AppNode = BuiltInNode | PositionLoggerNode;

export const initialNodes: AppNode[] = [
  { id: "1", type: "position-logger", position: { x: 0, y: 0 }, data: { label: "" , imgUrl:"https://icon.icepanel.io/AWS/svg/Database/RDS.svg", description:"RDS는 데이터베이스를 손쉽게 생성하고 관리할 수 있도록 지원하는 서비스입니다. 데이터 저장과 검색 등 중요한 데이터베이스 작업을 자동으로 처리하여 효율적인 운영을 가능하게 합니다."}, },
  {
    id: "2",
    type: "position-logger",
    position: { x: -100, y: 100 },
    data: { label: "" , imgUrl:"https://icon.icepanel.io/AWS/svg/Compute/EC2.svg", description:"EC2는 사용자가 필요에 따라 서버를 생성하고 관리할 수 있도록 돕는 서비스입니다. 클라우드 상에서 서버를 쉽게 설정하고 운영할 수 있어 유연하고 확장 가능한 컴퓨팅 환경을 제공합니다."},
  },
];

export const nodeTypes = {
  "position-logger": PositionLoggerNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;

// 새로운 노드를 추가하는 함수
export const addNode = (keyword: string, nodes: AppNode[]): AppNode[] => {
  // 백엔드에서 전달된 키워드에 따라 새로운 노드 생성

  // 마지막 노드의 y축 위치를 참조하여 50씩 증가시킴
  const lastNodeY = nodes.length > 0 ? nodes[nodes.length - 1].position.y : 0;
  const lastNodeX = nodes.length > 0 ? nodes[nodes.length - 1].position.x : 0;
  const newNodeX = lastNodeX+ 80;
  const imageChange =keyword==="EC2"? "https://icon.icepanel.io/AWS/svg/Compute/EC2.svg" : "https://icon.icepanel.io/AWS/svg/Database/DynamoDB.svg"
  const newNode : PositionLoggerNode ={
    id: (nodes.length + 1).toString(),
    type: "position-logger",
    position: { x: newNodeX, y: lastNodeY},  // 랜덤 위치로 설정
    data: {
      label: keyword,
      imgUrl: imageChange,
      description: `${keyword}는 AWS의 주요 컴퓨팅 서비스 중 하나입니다.`
    }
  };
  
  // 기존 노드 배열에 새 노드를 추가한 배열을 반환
  return [...nodes, newNode];
};