import type { Node, NodeTypes, BuiltInNode } from "@xyflow/react";
import { PositionLoggerNode } from "./PositionLoggerNode";
import { Handle, Position } from '@xyflow/react';
export type PositionLoggerNode = Node<
  {
    label?: string;
    imgUrl? :string;
  },
  "position-logger"
>;

export type AppNode = BuiltInNode | PositionLoggerNode;

export const initialNodes: AppNode[] = [
  { id: "1", type: "position-logger", position: { x: 0, y: 0 }, data: { label: "" , imgUrl:"https://icon.icepanel.io/AWS/svg/Database/RDS.svg"}, },
  {
    id: "2",
    type: "position-logger",
    position: { x: -100, y: 100 },
    data: { label: "" , imgUrl:"https://icon.icepanel.io/AWS/svg/Database/RDS.svg"},
  },
  { id: "c",  type: "position-logger", position: { x: 100, y: 100 },  data: { label: "" , imgUrl:"https://icon.icepanel.io/AWS/svg/Database/RDS.svg"}, },
  {
    id: "d",
    type: "position-logger",
    position: { x: 0, y: 200 },
    data: { label: "" , imgUrl:"https://icon.icepanel.io/AWS/svg/Database/RDS.svg"},
  },
];

export const nodeTypes = {
  "position-logger": PositionLoggerNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
