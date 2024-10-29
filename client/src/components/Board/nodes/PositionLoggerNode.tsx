import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { type PositionLoggerNode } from "./";
import "./node.css";

export function PositionLoggerNode({
  positionAbsoluteX,
  positionAbsoluteY,
  data,
}: NodeProps<PositionLoggerNode>) {
  const [isHovered, setIsHovered] = useState(false);
  const [bodyPosition, setBodyPosition] = useState({ x: 0, y: 0 });

  const nodeRef = useRef<HTMLDivElement | null>(null);

  // 노드의 document.body 기준 상대 좌표를 계산
  useEffect(() => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect(); // 노드의 절대 좌표 가져오기
      const newBodyPosition = {
        x: rect.left + window.scrollX, // 스크롤 보정
        y: rect.top + window.scrollY, // 스크롤 보정
      };
      setBodyPosition(newBodyPosition); // body 기준 상대 좌표 설정
    }
  }, [positionAbsoluteX, positionAbsoluteY, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // 설명창을 document.body 위에 그리기 위한 포탈
  const descriptionPortal = isHovered
    ? ReactDOM.createPortal(
        <div
          className="hover-description"
          style={{
            top: `${bodyPosition.y}px`, // body 기준 상대 Y 좌표
            left: `${bodyPosition.x}px`, // body 기준 상대 X 좌표
            transform: "translate(20%, -100%)",
          }}
        >
          {data.description}
        </div>,
        document.body
      )
    : null;

  return (
    <div
      ref={nodeRef} // 노드에 ref 연결
      className="service-node"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* {data.label && <div>{data.label}</div>} */}
      {/* <Handle type="source" position={Position.Right} id="a" /> */}
      <img src={data.imgUrl} alt="ec2" className="node-img" />
      {/* <Handle type="target" position={Position.Left} id="b" /> */}
      {descriptionPortal /* 설명창이 document.body 위에 포탈로 렌더링됨 */}
    </div>
  );
}
