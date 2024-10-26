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
  {  id:"1",
    type:"default",
    position: { x: 0, y: 0},
    data: { label: "Server" },
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width:"50px",
      height:"50px",
      background: 'transparent',
      borderStyle: 'dashed',
      borderWidth: 2,
      borderRadius: "10px",
      borderColor: 'gray', // 원하는 색상으로 설정
    }, },
    {  id:"2",
      type:"default",
      position: { x: 0, y: 100},
      data: { label: "DB" },
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width:"50px",
        height:"50px",
        background: 'transparent',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderRadius: "10px",
        borderColor: 'gray', // 원하는 색상으로 설정
      }, },
  {
    id:"3",
    type:"default",
    position: { x: 0, y: 200 },
    data: { label: "Storage" },
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width:"50px",
      height:"50px",
      background: 'transparent',
      borderStyle: 'dashed',
      borderWidth: 2,
      borderRadius: "10px",
      borderColor: 'gray', // 원하는 색상으로 설정
    },
  }
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
  const imageChange = 
  keyword === "EC2" 
    ? "https://icon.icepanel.io/AWS/svg/Compute/EC2.svg" 
    : keyword === "RDS" 
    ? "https://icon.icepanel.io/AWS/svg/Database/RDS.svg" 
    : "https://icon.icepanel.io/AWS/svg/Storage/S3.svg";

  const newNode : PositionLoggerNode ={
    id: (nodes.length + 1).toString(),
    type: "position-logger",
    position: { x: newNodeX, y: lastNodeY},  
    data: {
      label: keyword,
      imgUrl: imageChange,
      description: `${keyword}는 AWS의 주요 컴퓨팅 서비스 중 하나입니다.`
    }
  };
  
  // 기존 노드 배열에 새 노드를 추가한 배열을 반환
  return [...nodes, newNode];
};

export const replaceNode = (keyword: string, nodeId: string, nodes: AppNode[]): AppNode[] => {
  const imageChange = 
  keyword === "EC2" 
    ? "https://icon.icepanel.io/AWS/svg/Compute/EC2.svg" 
    : keyword === "RDS" 
    ? "https://icon.icepanel.io/AWS/svg/Database/RDS.svg" 
    : "https://icon.icepanel.io/AWS/svg/Storage/S3.svg";

  return nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        type: "position-logger", // 새로운 커스텀 노드 타입으로 변경
        data: {
          ...node.data,
          label: keyword, // 필요시 새 label 설정
          imgUrl: imageChange,
          description:`${keyword}는 AWS의 주요 컴퓨팅 서비스 중 하나입니다.`,
        },
        style: {
          border:"none",
        },
      };
    }
    return node;
  });
};