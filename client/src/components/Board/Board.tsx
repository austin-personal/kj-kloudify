import {
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import html2canvas from "html2canvas";
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

import { initialNodes, nodeTypes, addNode, replaceNode } from "./nodes";
import { initialEdges, edgeTypes, addConnectEdge } from "./edges";

// Props 타입 정의
interface BoardProps {
  height?: string; // 높이는 선택적이며 문자열로 받을 것
  borderRadius?: string; // border-radius도 선택적이며 문자열로 받을 것
  parsedData: string[]; //여기 안에 채팅 답변에 포함된 서비스 이름들이 들어올것임.
}

const Board = forwardRef(
  (
    {
      height = "540px",
      borderRadius = "15px 0px 15px 15px",
      parsedData,
    }: BoardProps,
    ref
  ) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] =
      useEdgesState<Edge<Record<string, unknown>, string | undefined>>(
        initialEdges
      );
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

    // 스크린샷 기능을 상위 컴포넌트에서 사용할 수 있게 제공
    useImperativeHandle(ref, () => ({
      takeScreenshot() {
        if (reactFlowWrapper.current) {
          html2canvas(reactFlowWrapper.current).then((canvas) => {
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "react-flow-screenshot.png";
            link.click();
          });
        }
      },
    }));

    const onConnect: OnConnect = useCallback(
      (connection) => setEdges((edges) => addEdge(connection, edges)),
      [setEdges]
    );

    const handleAddNode = useCallback(
      (nodeLabel: string) => {
        const newNodes = addNode(nodeLabel, nodes);
        setNodes(newNodes);
      },
      [nodes, setNodes]
    );

    const handleConnectNode = () => {
      const DynamoDBNode = nodes.find((node) => node.data.label === "DynamoDB");
      const ec2Node = nodes.find((node) => node.data.label === "EC2");
      if (ec2Node && DynamoDBNode) {
        const newEdges = addConnectEdge(DynamoDBNode.id, ec2Node.id, edges);
        setEdges(newEdges);
      }
    };

    return (
      <div
        className="board"
        ref={reactFlowWrapper}
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
            <button onClick={() => handleAddNode("EC2")}>노드 생성2</button>
            <button onClick={handleConnectNode}>연결 생성</button>
          </Panel>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    );
  }
);

export default Board;
