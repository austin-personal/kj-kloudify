import { Handle, Position, type NodeProps } from "@xyflow/react";

import { type PositionLoggerNode } from "./";
import "./node.css";

export function PositionLoggerNode({
  positionAbsoluteX,
  positionAbsoluteY,
  data,
}: NodeProps<PositionLoggerNode>) {
  const x = `${Math.round(positionAbsoluteX)}px`;
  const y = `${Math.round(positionAbsoluteY)}px`;

  return (
    <div className="service-node">
      {data.label && <div>{data.label}</div>}
      <Handle type="source" position={Position.Right} id="a" />
      <img src={data.imgUrl} alt="ec2" className="node-img" />
      <Handle type="target" position={Position.Left} id="b" />
    </div>
  );
}
