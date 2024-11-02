import React, { useEffect, useRef } from "react";
import * as mermaid from "mermaid";
import * as d3 from "d3";
import "./mermaid.css";

interface MermaidChartProps {
  chartCode: string[];
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chartCode }) => {
  const chartString = `${chartCode
    .map((code) => `${code.replace(/^\[|\]$/g, "").replace(/;/g, "\n  ")}`)
    .join("\n  ")}`;

  const svgRef = useRef<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
    null
  );

  useEffect(() => {
    mermaid.default.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      betaFeatures: true,
    } as any);

    const element = document.querySelector(".mermaid");
    if (element) {
      mermaid.default
        .render("mermaidChart", chartString)
        .then((result: { svg: string }) => {
          element.innerHTML = result.svg;

          const svg = d3.select<SVGSVGElement, unknown>(
            element.querySelector("svg")!
          );
          svgRef.current = svg; // SVG 참조 저장
          const innerGroup = svg.select<SVGGElement>("g");
          // 컨테이너 크기에 맞춰 SVG 크기 조정
          svg
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("preserveAspectRatio", "xMinYMin meet");
          zoomBehavior.current = d3
            .zoom<SVGSVGElement, unknown>()
            .on("zoom", (event) => {
              innerGroup.attr("transform", event.transform.toString());
            });

          svg.call(
            zoomBehavior.current as unknown as (
              selection: d3.Selection<SVGSVGElement, unknown, null, undefined>
            ) => void
          );
        })
        .catch((error) => console.error("Mermaid rendering error:", error));
    }
  }, [chartString]);

  // 줌 인 함수
  const zoomIn = () => {
    if (svgRef.current && zoomBehavior.current) {
      svgRef.current
        .transition()
        .call(zoomBehavior.current.scaleBy as any, 1.2);
    }
  };

  // 줌 아웃 함수
  const zoomOut = () => {
    if (svgRef.current && zoomBehavior.current) {
      svgRef.current
        .transition()
        .call(zoomBehavior.current.scaleBy as any, 0.8);
    }
  };

  // 전체 화면에 맞추기 함수
  const fitView = () => {
    if (svgRef.current && zoomBehavior.current) {
      svgRef.current
        .transition()
        .call(zoomBehavior.current.transform as any, d3.zoomIdentity);
    }
  };

  return (
    <div className="mermaid-container">
      <div className="mermaid">{chartString}</div>
      <div className="zoom-controls">
        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>-</button>
        <button onClick={fitView}>
          <img src="https://api.iconify.design/material-symbols:fit-screen.svg" />
        </button>
      </div>
    </div>
  );
};

export default MermaidChart;
