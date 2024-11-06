import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import mermaid from "mermaid";
import { select, zoom, ZoomBehavior, zoomIdentity } from "d3";
import "./mermaid.css";
import { extractServiceName } from "../../utils/awsServices";
interface MermaidChartProps {
  chartCode: string[];
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chartCode }) => {
  const [isDetails, setIsDetails] = useState(false);
  const data = localStorage.getItem("finishData");
  const location = useLocation();
  console.log("파싱파싱22:", chartCode);

  // `home` 경로에서만 popup 클래스가 적용되도록 설정
  const isHomePage = location.pathname.startsWith("/home");
  const popupClass = isHomePage ? "" : "isNothome"; // home 페이지일 때만 popup 클래스 추가

  const result = chartCode.map((code) => {
    // 양 끝에 있는 대괄호 제거
    return code.replace(/^\[|\]$/g, "");
  });

  const chartString =
    result[0] ||
    `flowchart LR
  A[Welcome to Kloudify!]
  B[채팅으로 AWS 아키텍처를 실시간으로 구축하고,\n Mermaid 시각화를 통해 확인하세요.]
  style A font-size:34px;
  classDef transparent fill-opacity:0,stroke-width:0
  class A,B transparent`;
  console.log("result:", result[0]);
  const togglePopup = () => {
    setIsDetails(!isDetails);
  };
  const svgRef = useRef<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const zoomBehavior = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(
    null
  );

  useEffect(() => {
    // Mermaid 설정
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "default",
      flowchart: { curve: "linear", useMaxWidth: false },
      themeVariables: {
        primaryColor: "#cbe8f8",
      },
    });

    const renderDiagram = async () => {
      const element = document.querySelector(".mermaid-container");
      if (element) {
        try {
          const { svg } = await mermaid.render("mermaid", chartString);
          element.innerHTML = svg;

          const svgElement = element.querySelector("svg") as SVGSVGElement;
          if (svgElement) {
            svgElement.setAttribute("width", "100%");
            svgElement.setAttribute("height", "100%");
            svgRef.current = select(svgElement) as d3.Selection<
              SVGSVGElement,
              unknown,
              null,
              undefined
            >;
            const innerGroup = svgRef.current.select<SVGGElement>("g");

            // 줌 설정
            zoomBehavior.current = zoom<SVGSVGElement, unknown>()
              .scaleExtent([0.5, 5])
              .on("zoom", (event) => {
                innerGroup.attr("transform", event.transform.toString());
              });

            svgRef.current.call(zoomBehavior.current);

            const paragraphsWithImages = element.querySelectorAll(
              "#mermaid p:has(img)"
            );

            const serviceNames = Array.from(
              chartString.matchAll(/(\b\w+)(?=\s*\[<img\s)/g)
            ).map((match) => match[1]);
            // console.log("서비스 이름:", serviceNames);

            paragraphsWithImages.forEach((paragraph, index) => {
              let textContent = paragraph.textContent || "";
              console.log("정규식 전:", textContent);
              const serviceName = extractServiceName(serviceNames[index]);
              textContent = extractServiceName(textContent);
              console.log("정규식 후:", serviceName);
              console.log("정규식 후2:", textContent);

              const imgElement = paragraph.querySelector("img");
              const imgSrc = (imgElement as HTMLImageElement).src;
              const extractedName = imgSrc
                .split("/")
                .pop()
                ?.replace(".svg", "");

              try {
                (
                  imgElement as HTMLImageElement
                ).src = require(`../../img/aws-icons/${
                  serviceName || textContent
                }.svg`);
                (imgElement as HTMLImageElement).style.width = "35.5px";
                (imgElement as HTMLImageElement).style.height = "35.5px";
              } catch (error) {
                console.error(
                  `이미지를 로드할 수 없습니다: ${serviceName}`,
                  error
                );
                (imgElement as HTMLImageElement).src =
                  require(`../../img/aws-icons/default.svg`).default;
              }
              // console.log(`Paragraph ${index + 1} img src: ${imgSrc}`);
              // console.log(`Paragraph ${index + 1} text: ${textContent}`);
            });

            // 모든 노드의 foreignObject > div를 선택
            const nodeDivs = document.querySelectorAll("foreignObject > div");
            const nodeDivss = document.querySelectorAll("svg foreignObject");

            nodeDivss.forEach((nodeDiv) => {
              // 원하는 스타일 속성 적용
              (nodeDiv as HTMLElement).style.position = "relative"; // 예시로 높이 설정
              (nodeDiv as HTMLElement).style.width = "100%"; // 예시로 높이 설정
              (nodeDiv as HTMLElement).style.height = "100%"; // 예시로 높이 설정
              // 추가 스타일 설정 가능
            });

            nodeDivs.forEach((nodeDiv) => {
              // 원하는 스타일 속성 적용
              (nodeDiv as HTMLElement).style.lineHeight = "1"; // 예시로 높이 설정
              (nodeDiv as HTMLElement).style.flex = "1"; // 예시로 높이 설정
              // (nodeDiv as HTMLElement).style.position = "absolute";
              (nodeDiv as HTMLElement).style.height = "100%";
              // 추가 스타일 설정 가능
            });

            if (chartCode.length === 0) {
              //아키텍쳐 보드 데이터가 없을 때 나오는 Mermaid가 생성한 <p> 요소에 애니메이션 클래스 추가
              const textElement = element.querySelector("#mermaid p");

              if (textElement) {
                textElement.classList.add("floating-text");
              }
            }
          }
        } catch (error) {
          console.error("Mermaid 렌더링 오류:", error);
        }
      }
    };

    renderDiagram();
  }, [chartString]);

  const zoomIn = () => {
    if (svgRef.current && zoomBehavior.current) {
      svgRef.current.transition().call(zoomBehavior.current.scaleBy, 1.2);
    }
  };

  const zoomOut = () => {
    if (svgRef.current && zoomBehavior.current) {
      svgRef.current.transition().call(zoomBehavior.current.scaleBy, 0.8);
    }
  };

  const fitView = () => {
    if (svgRef.current && zoomBehavior.current) {
      svgRef.current
        .transition()
        .call(zoomBehavior.current.transform, zoomIdentity);
    }
  };

  return (
    <div className="frame">
      <div
        className={`popup ${isDetails ? "visible" : "hidden"} ${popupClass}`}
        onClick={togglePopup}
      >
        {!isDetails ? "Details" : "Close"}
        {isDetails && (
          <div className="extra-content">
            {chartCode.length > 0 ? (
              <p>요약</p>
            ) : (
              <p>값이 없습니다</p> // 값이 없을 때 표시
            )}
          </div>
        )}
      </div>
      <div className="mermaid-container">
        <div id="mermaid"></div>
      </div>
      <div className="zoom-controls">
        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>-</button>
        <button onClick={fitView}>
          <img
            src="https://api.iconify.design/material-symbols:fit-screen.svg"
            alt="Fit View"
          />
        </button>
      </div>
    </div>
  );
};

export default MermaidChart;
