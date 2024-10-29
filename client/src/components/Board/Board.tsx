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
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  Panel,
  Edge,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { getLayoutedElements } from "./autoLayout";

import "./Board.css";

import {
  initialNodes,
  nodeTypes,
  addNode,
  replaceNode,
  addServiceNode,
} from "./nodes";
import { initialEdges, edgeTypes, addConnectEdge } from "./edges";

// Props 타입 정의
interface BoardProps {
  height?: string; // 높이는 선택적이며 문자열로 받을 것
  borderRadius?: string; // border-radius도 선택적이며 문자열로 받을 것
  parsedData: string[]; //여기 안에 채팅 답변에 포함된 필요한 요소들이 들어올것임.
  finishData: string[]; // finishData의 타입을 명시 //여기 안에 채팅 답변에 포함된 요소들의 결정된 서비스가 한번에 들어올것임.
}

const Board = forwardRef(
  (
    {
      height = "540px",
      borderRadius = "15px 0px 15px 15px",
      parsedData,
      finishData,
    }: BoardProps,
    ref
  ) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] =
      useEdgesState<Edge<Record<string, unknown>, string | undefined>>(
        initialEdges
      );
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
    const { fitView } = useReactFlow(); // fitView 메서드 사용

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
    //프레임 노드 생성
    useEffect(() => {
      if (parsedData.length > 0) {
        const lastElement = parsedData[parsedData.length - 1];
        console.log("초기화됐나확인", parsedData);
        console.log("새로운 마지막 요소:", lastElement);
        const newNodes = addNode(lastElement, nodes);
        setNodes(newNodes);
        // 노드가 추가된 후 fitView 호출
        // 상태 업데이트 후 약간의 지연 시간을 두고 fitView 호출
        setTimeout(() => {
          fitView({ padding: 0.5, duration: 500 });
        }, 50);
      }
    }, [parsedData[parsedData.length - 1], fitView]);

    // 새로운 엣지 추가 핸들러
    const handleAddEdge = (sourceNodeId: string, targetNodeId: string) => {
      setEdges((prevEdges) =>
        addConnectEdge(sourceNodeId, targetNodeId, prevEdges)
      );
    };

    //서비스 노드로 변경
    useEffect(() => {
      setNodes([]); //노드 초기화
      if (!finishData || finishData.length === 0) {
        console.log("finishData가 아직 로드되지 않았습니다.");
        return; // finishData가 없는 경우, 더 이상 실행하지 않습니다.
      } else {
        // 새로운 노드 배열을 생성합니다.
        let updatedNodes: any[] = [];

        for (let i = 0; i < finishData[0].length; i++) {
          const services = finishData.map((item: any) =>
            String(item[i].service)
          );
          const optionsValues = finishData.map((item: any) => item[i].options);
          // console.log("서비스 잘 왔나???", services[0]);
          // console.log("옵션 값 잘 왔나???", optionsValues[0]);
          const normalizedKeyword = services[0].toLowerCase();

          updatedNodes = addServiceNode(
            normalizedKeyword,
            optionsValues[0],
            updatedNodes
          );
        }
        handleAddEdge("ec2", "s3");
        handleAddEdge("ec2", "rds");
        handleAddEdge("cloudwatch", "ec2");
        // setNodes(updatedNodes);

        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(updatedNodes, edges);
        // layoutedNodes와 layoutedEdges를 기존 상태에 추가
        setNodes((prevNodes) => [...prevNodes, ...layoutedNodes]);
        setEdges((prevEdges) => [...prevEdges, ...layoutedEdges]);
      }
    }, [finishData]);

    const handleConnectNode = () => {
      const DynamoDBNode = nodes.find((node) => node.data.label === "DynamoDB");
      const ec2Node = nodes.find((node) => node.data.label === "EC2");
      if (ec2Node && DynamoDBNode) {
        const newEdges = addConnectEdge(DynamoDBNode.id, ec2Node.id, edges);
        setEdges(newEdges);
      }
    };

    useEffect(() => {
      const handleResize = () => {
        fitView({ duration: 100 });
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [fitView]);

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
          edges={edges}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Panel>
            {/* <button onClick={handleConnectNode}>연결 생성</button> */}
          </Panel>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    );
  }
);

export default Board;
