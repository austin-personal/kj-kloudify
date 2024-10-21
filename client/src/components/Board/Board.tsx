import { useCallback, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import "./Board.css";

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";

export default function Board() {
  const [isOpen, setIsOpen] = useState(false);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );
  const togglePopup = () => {
    setIsOpen(!isOpen); // 현재의 isOpen 상태를 반대로 설정
  };
  return (
    <div className="right-side">
      <h1 className="project-name">Project: Namanmu</h1>
      <div className="board">
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          edges={edges}
          edgeTypes={edgeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>

        <div
          className={`popup ${isOpen ? "visible" : "hidden"}`}
          onClick={togglePopup}
        >
          {!isOpen ? "Summary" : "Close"}
          {isOpen && (
            <div className="extra-content">
              <p>확장된 영역의 추가 텍스트 1</p>
            </div>
          )}
        </div>
        <button className="review-btn">Finish & Review</button>
      </div>
    </div>
  );
}
