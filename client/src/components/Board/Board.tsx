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

import "./Board.css";

import { initialNodes, nodeTypes, addNode, replaceNode } from "./nodes";
import { initialEdges, edgeTypes, addConnectEdge } from "./edges";

// Props 타입 정의
interface BoardProps {
  height?: string; // 높이는 선택적이며 문자열로 받을 것
  borderRadius?: string; // border-radius도 선택적이며 문자열로 받을 것
  parsedData: string[]; //여기 안에 채팅 답변에 포함된 서비스 이름들이 들어올것임.
  nodes: any[]; // 노드 배열을 상위 컴포넌트에서 전달받음
  setNodes: (nodes: any[]) => void; // 노드 상태 업데이트 함수
}

const Board = forwardRef(
  (
    {
      height = "540px",
      borderRadius = "15px 0px 15px 15px",
      parsedData,
      nodes,
      setNodes,
    }: BoardProps,
    ref
  ) => {
    // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
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

    // 세션 스토리지에서 상태 불러오기
    const loadStateFromSession = () => {
      const savedNodes = sessionStorage.getItem("nodes");
      const savedEdges = sessionStorage.getItem("edges");

      if (savedNodes) {
        setNodes(JSON.parse(savedNodes));
      }
      if (savedEdges) {
        setEdges(JSON.parse(savedEdges));
      }
    };

    // 컴포넌트가 마운트될 때 세션 스토리지에서 상태 불러오기
    useEffect(() => {
      loadStateFromSession();
    }, []);

    const onConnect: OnConnect = useCallback(
      (connection) => setEdges((edges) => addEdge(connection, edges)),
      [setEdges]
    );
    //테스트용 더미 data
    const testData = [
      {
        service: "ec2",
        options: {
          ami: "ami-02c329a4b4aba6a48",
          instance_type: "t2.micro",
          public: true,
          subnet_id: "subnet-0189db2034ce49d30",
        },
      },
    ];
    //서비스 이름 추출
    const service_values = testData[0].service;
    //상세정보 띄우기 위한 option 추출
    const options_values: any[] = Object.values(testData[0].options);
    console.log(options_values);

    // 함수의 메모이제이션을 제공,함수의 의존성을 명시하여 최신 상태를 참조하도록 보장
    const handleAddNode = useCallback(() => {
      const newNodes = addNode(service_values, nodes);
      setNodes(newNodes);
      // 노드가 추가된 후 fitView 호출
      // 상태 업데이트 후 약간의 지연 시간을 두고 fitView 호출
      setTimeout(() => {
        fitView({ padding: 0.5, duration: 500 });
      }, 50);
    }, [nodes, setNodes, fitView]);

    const deleteAllNodes = () => {
      setNodes([]); // 노드 상태를 빈 배열로 설정
      sessionStorage.removeItem("nodes"); // 세션 스토리지에서 노드 데이터 삭제
    };
    const handleConnectNode = () => {
      const DynamoDBNode = nodes.find((node) => node.data.label === "DynamoDB");
      const ec2Node = nodes.find((node) => node.data.label === "EC2");
      if (ec2Node && DynamoDBNode) {
        const newEdges = addConnectEdge(DynamoDBNode.id, ec2Node.id, edges);
        setEdges(newEdges);
      }
    };
    const handleReplaceNode = useCallback(() => {
      const newNodes = replaceNode(service_values, "1", options_values, nodes);
      setNodes(newNodes);
    }, [nodes, setNodes]);

    // 화면 크기 변경 시 fitView 호출
    useEffect(() => {
      const handleResize = () => {
        fitView({ duration: 100 });
      };

      // 리사이즈 이벤트 리스너 추가
      window.addEventListener("resize", handleResize);

      // 컴포넌트가 언마운트될 때 리사이즈 이벤트 리스너 제거
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
          // onNodesChange={onNodesChange}
          edges={edges}
          edgeTypes={edgeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Panel>
            <button onClick={handleAddNode}>프레임 노드 생성</button>
            <button onClick={handleReplaceNode}>서비스 노드 변신</button>
            <button onClick={handleConnectNode}>연결 생성</button>
            <button onClick={deleteAllNodes}>노드 모두 삭제</button>
          </Panel>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    );
  }
);

export default Board;
