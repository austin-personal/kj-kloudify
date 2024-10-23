import type { Node, NodeTypes, BuiltInNode } from "@xyflow/react";
import { PositionLoggerNode } from "./PositionLoggerNode";
import { Handle, Position } from '@xyflow/react';
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
