import { useCallback, useEffect } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  Panel,
  Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import "./Board.css";

import { initialNodes, nodeTypes, addNode } from "./nodes";
import { initialEdges, edgeTypes, addConnectEdge } from "./edges";

// Props 타입 정의
interface BoardProps {
  height?: string; // 높이는 선택적이며 문자열로 받을 것
  borderRadius?: string; // border-radius도 선택적이며 문자열로 받을 것
  parsedData: string[]; //여기 안에 채팅 답변에 포함된 서비스 이름들이 들어올것임.
}

const Board: React.FC<BoardProps> = ({
  height = "540px",
  borderRadius = "15px 0px 15px 15px",
  parsedData,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge<Record<string, unknown>, string | undefined>>(
      initialEdges
    );
  // 사용자 연결 이벤트를 처리하는 onConnect 핸들러
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );
  //노드 추가 함수
  const handleAddNode = useCallback(
    (nodeLabel: string) => {
      const newNodes = addNode(nodeLabel, nodes);
      setNodes(newNodes); // 상태 업데이트
    },
    [nodes, setNodes]
  );
  //노드 간 연결 해주는 함수
  const handleConnectNode = () => {
    const DynamoDBNode = nodes.find((node) => node.data.label === "DynamoDB");
    const ec2Node = nodes.find((node) => node.data.label === "EC2");
    if (ec2Node && DynamoDBNode) {
      const newEdges = addConnectEdge(DynamoDBNode.id, ec2Node.id, edges);
      setEdges(newEdges);
    }
  };
  // parsedData 변경 시 노드 자동 추가
  useEffect(() => {
    if (parsedData.length > 0) {
      // parsedData 배열의 모든 요소에 대해 노드 추가
      parsedData.forEach((service) => {
        handleAddNode(service); // 각 서비스 이름에 해당하는 노드 추가
      });
    }
  }, [parsedData, handleAddNode]); // parsedData가 변경될 때마다 실행
  return (
    <div
      className="board"
      style={{
        height: height || "540px",
        borderRadius: borderRadius || "15px 0px 15px 15px",
      }}
    >
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
        <Panel>
          <button onClick={() => handleAddNode("DynamoDB")}>노드 생성1</button>
          <button onClick={() => handleAddNode("EC2")}>노드 생성2</button>
          <button onClick={handleConnectNode}>연결 생성</button>
        </Panel>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Board;
