import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import mermaid from "mermaid";
import { select, zoom, ZoomBehavior, zoomIdentity } from "d3";
import "./mermaid.css";
import { extractServiceName } from "../../utils/awsServices";
import Lottie from "lottie-react";
import MermaidIntroAnimation from "./MermaidIntroAnimation.json";

interface MermaidChartProps {
  chartCode: string[];
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chartCode }) => {
  const [prevChartString, setPrevChartString] = useState<string | null>(null);
  const data = localStorage.getItem("finishData");
  const location = useLocation();

  const getImagePath = (name: string) => {
    try {
      console.log("전:", name);
      const serviceName = extractServiceName(name);
      console.log("후2:", serviceName);
      return require(`../../img/aws-icons/${serviceName}.svg`);
    } catch (error) {
      const serviceName = extractServiceName(name);
      console.warn(`Image not found: ${serviceName}. Using default image.`);
      return "https://icon.icepanel.io/AWS/svg/Compute/EC2.svg"; // 기본 이미지 경로 설정
    }
  };

  const result = chartCode.map((code) => {
    return code.replace(/^\[|\]$/g, "").replace(/[()]/g, "");
  });

  const chartString = result[0] || "";
  console.log("result:", chartString);
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
    if (chartString === prevChartString) return; // chartString이 동일하면 렌더링 생략

    // Mermaid 설정
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "default",
      flowchart: { curve: "linear", useMaxWidth: false },
      themeVariables: {
        primaryColor: "#cbe8f8",
      },
      themeCSS: `
      .node p {
        text-align:center;
        font-weight: bold;
         line-height: 1;
      }
      .node img {
        height: 60px;
        object-fit: contain;
      }
    `,
    });
    const renderDiagram = async () => {
      const element = document.querySelector(".mermaid-container");
      if (element) {
        try {
          const { svg } = await mermaid.render("mermaid", chartString);
          element.innerHTML = svg;
          setPrevChartString(chartString); // 렌더링 완료 후 chartString 상태 업데이트

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

            // 이미지 처리 추가 부분
            const paragraphsWithImages = element.querySelectorAll(
              "#mermaid p:has(img)"
            );

            paragraphsWithImages.forEach((paragraph) => {
              const imgElement = paragraph.querySelector("img");
              const imgSrc = (imgElement as HTMLImageElement).src;
              let extractedName = imgSrc.split("/").pop()?.replace(".svg", "");
              console.log("extractedName:", extractedName);
              // getAwsIcon 함수 사용
              (imgElement as HTMLImageElement).src = getImagePath(
                extractedName || "default"
              );
            });
          }
        } catch (error) {
          console.error("Mermaid 렌더링 오류:", error);
        }
      }
    };
    if (chartString) {
      renderDiagram();
    }
  }, [chartString, prevChartString]); // chartString 변경 시에만 실행

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
      <div className="mermaid-container">
        {chartString ? (
          <div id="mermaid"></div>
        ) : (
          <div className="intro-container">
            <h1>Welcome to Kloudify!</h1>
            <p>
              채팅으로 AWS 아키텍처를 실시간으로 구축하고,
              <br />
              Mermaid 시각화를 통해 확인하세요.
            </p>
            <Lottie
              animationData={MermaidIntroAnimation}
              style={{ width: "350px", height: "350px" }}
              className="lottie-animation"
            />
          </div>
        )}
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
