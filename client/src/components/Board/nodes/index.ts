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
  // {  id:"1",
  //   type:"default",
  //   position: { x: 0, y: 0},
  //   data: { label: "Server" },
  //   style: {
  //     display: 'flex',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     width:"50px",
  //     height:"50px",
  //     background: 'transparent',
  //     borderStyle: 'dashed',
  //     borderWidth: 2,
  //     borderRadius: "10px",
  //     borderColor: 'gray', // 원하는 색상으로 설정
  //   }, },
  //   {  id:"2",
  //     type:"default",
  //     position: { x: 0, y: 100},
  //     data: { label: "DB" },
  //     style: {
  //       display: 'flex',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       width:"50px",
  //       height:"50px",
  //       background: 'transparent',
  //       borderStyle: 'dashed',
  //       borderWidth: 2,
  //       borderRadius: "10px",
  //       borderColor: 'gray', // 원하는 색상으로 설정
  //     }, },
  // {
  //   id:"3",
  //   type:"default",
  //   position: { x: 0, y: 200 },
  //   data: { label: "Storage" },
  //   style: {
  //     display: 'flex',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     width:"50px",
  //     height:"50px",
  //     background: 'transparent',
  //     borderStyle: 'dashed',
  //     borderWidth: 2,
  //     borderRadius: "10px",
  //     borderColor: 'gray', // 원하는 색상으로 설정
  //   },
  // }
];

export const nodeTypes = {
  "position-logger": PositionLoggerNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;

// 서비스 프레임 노드 생성 버전
export const addNode = (keyword: string, nodes: AppNode[]): AppNode[] => {
  // 백엔드에서 전달된 키워드에 따라 새로운 노드 생성

  // 마지막 노드의 y축 위치를 참조하여 50씩 증가시킴
  const lastNodeY = nodes.length > 0 ? nodes[nodes.length - 1].position.y : 0;
  const lastNodeX = nodes.length > 0 ? nodes[nodes.length - 1].position.x : 0;
  const newNodeX = lastNodeX+ 80;

  const newNode: AppNode =
    {  id:(nodes.length).toString(),
      type:"default",
      position: { x: newNodeX, y: lastNodeY},
      data: { label: keyword },
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
  };
  
  // 기존 노드 배열에 새 노드를 추가한 배열을 반환
  return [...nodes, newNode];
};

export const replaceNode = (keyword: string, nodeId: string, options:any[], nodes: AppNode[]): AppNode[] => {
   //require를 사용하여 이미지 경로를 가져옴
   // keyword를 소문자로 변환
   console.log("keyword:",keyword);
   console.log("nodeId:", nodeId);

   let imageChange: string;
   try {
     imageChange = require(`../../../img/aws-icons/${keyword}.svg`);
   } catch (error) {
     imageChange = require(`../../../img/aws-icons/ec2.svg`); //경로에 없을 시 ec2 이미지가 디폴트로 나올것임.
   }
 
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        type: "position-logger", // 새로운 커스텀 노드 타입으로 변경
        data: {
          ...node.data,
          label: keyword, // 필요시 새 label 설정
          imgUrl: imageChange,
          description: Array.isArray(options) ? options.join(", ") : JSON.stringify(options),
        },
        style: {
          border:"none",
        },
      };
    }
    return node;
  });
};


// 새로운 노드를 추가하는 함수
// 서비스 노드 생성 버전
export const addServiceNode = (keyword: string, options:any[],nodes: AppNode[]): AppNode[] => {
  // 백엔드에서 전달된 키워드에 따라 새로운 노드 생성

  // 마지막 노드의 y축 위치를 참조하여 50씩 증가시킴
  const lastNodeY = nodes.length > 0 ? nodes[nodes.length - 1].position.y : 0;
  const lastNodeX = nodes.length > 0 ? nodes[nodes.length - 1].position.x : 0;
  const newNodeX = lastNodeX+ 80;
  //require를 사용하여 이미지 경로를 가져옴
  let imageChange;
  try {
    imageChange = require(`../../../img/aws-icons/${keyword}.svg`);
  } catch (error) {
    imageChange = require(`../../../img/aws-icons/ec2.svg`); //경로에 없을 시 ec2 이미지가 디폴트로 나올것임.
  }
  const newNode : PositionLoggerNode ={
    id: (nodes.length + 1).toString(),
    type: "position-logger",
    position: { x: newNodeX, y: lastNodeY},  
    data: {
      label: keyword,
      imgUrl: imageChange,
      description: Array.isArray(options) ? options.join(", ") : JSON.stringify(options),
    }
  };
  
  // 기존 노드 배열에 새 노드를 추가한 배열을 반환
  return [...nodes, newNode];
};