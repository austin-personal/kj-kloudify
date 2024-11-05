import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import mermaid from "mermaid";
import { select, zoom, ZoomBehavior, zoomIdentity } from "d3";
import "./mermaid.css";

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
  // if (chartCode.length === 0) {
  //   const temp = data ? data.replace(/^\[|\]$/g, "").replace(/^"|"$/g, "") : ""; // data가 null일 경우 빈 문자열
  //   chartCode = [temp];
  // }
  const togglePopup = () => {
    setIsDetails(!isDetails);
  };
  const chartString =
    `${chartCode
      .map((code) => {
        // 시작 부분에 [ 가 있으면 끝 부분의 ] 를 제거
        if (code.startsWith("[")) {
          return code
            .replace(/^\[|\]$/g, "") // 시작의 [ 와 끝의 ] 를 제거
            .replace(/;/g, "\n  ") // 끝의 세미콜론을 제거
            .replace(/[()]/g, "");
        } else {
          // 시작 부분에 [가 없으면 끝의 ]를 제거하지 않음
          return code
            .replace(/^\[/, "") // 시작 부분의 [ 만 제거
            .replace(/;/g, "\n  ") // 끝의 세미콜론을 제거
            .replace(/[()]/g, ""); // 끝의 () 괄호만 제거
        }
      })
      .join("\n  ")}` ||
    `flowchart LR
    A[Welcome to Kloudify!]
    B[채팅으로 AWS 아키텍처를 실시간으로 구축하고,\n Mermaid 시각화를 통해 확인하세요.]
    style A font-size:34px;
    classDef transparent fill-opacity:0,stroke-width:0
    class A,B transparent`;

  console.log("파싱파싱:", chartString);
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
      theme: "base",
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
            paragraphsWithImages.forEach((paragraph, index) => {
              let textContent = paragraph.textContent || "";

              // "Amazon"으로 시작하는 경우 "Amazon" 제거
              if (textContent.startsWith("Amazon")) {
                textContent = textContent.replace(/^Amazon\s*/, ""); // "Amazon " (뒤 공백 포함) 제거
              } else if (textContent.startsWith("AWS")) {
                textContent = textContent.replace(/^AWS\s*/, ""); // "Amazon " (뒤 공백 포함) 제거
              }
              textContent = textContent.replace(/\s+/g, "-");

              const imgElement = paragraph.querySelector("img");

              const imgSrc = (imgElement as HTMLImageElement).src;
              const extractedName = imgSrc
                .split("/")
                .pop()
                ?.replace(".svg", "");

              try {
                (
                  imgElement as HTMLImageElement
                ).src = require(`../../img/aws-icons/${textContent}.svg`);
                console.log(
                  `잘? ${index + 1} img src: ${
                    (imgElement as HTMLImageElement).src
                  }`
                );
              } catch (error) {
                console.log("????");
                (imgElement as HTMLImageElement).src =
                  require(`../../img/aws-icons/default.svg`).default;
              }

              console.log("어디서 멈춤?");
              console.log(`Paragraph ${index + 1} img src: ${imgSrc}`);
              console.log(`Paragraph ${index + 1} text: ${textContent}`);
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

function convertImageToBase64(
  url: string,
  callback: (base64Data: string | null) => void
) {
  const img = new Image();
  img.src = url;
  img.crossOrigin = "Anonymous";
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      const dataURL = canvas.toDataURL("image/png"); // Base64로 변환
      callback(dataURL);
    } else {
      callback(null);
    }
  };

  img.onerror = function () {
    console.error(`Failed to load image at ${url}`);
    callback(null);
  };
}

export default MermaidChart;
