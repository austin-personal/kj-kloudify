import React from "react";
import "./DonutChart.css";

// Props 타입 정의
interface DonutChartProps {
  slices: number[]; // 조각들의 비율을 퍼센트로 나타낸 배열 (ex: [25, 35, 40])
}

const DonutChart: React.FC<DonutChartProps> = ({ slices }) => {
  let cumulativeRotation = 0; // 조각들이 차례로 회전할 각도를 누적하여 사용

  return (
    <div className="donut-chart">
      {slices.map((slice, index) => {
        const rotation = cumulativeRotation;
        const sliceRotation = (slice / 100) * 360; // 비율에 따른 각도 계산
        cumulativeRotation += sliceRotation; // 다음 조각의 회전 각도 누적

        return (
          <div
            key={index}
            className="slice"
            style={{
              backgroundColor: getColor(index), // 각 조각에 대한 색상 동적 할당
              transform: `rotate(${rotation}deg)`,
              clip: slice > 50 ? "rect(auto, auto, auto, auto)" : "", // 50% 이상인 경우 커버
            }}
          >
            <div
              className="slice-cover"
              style={{
                transform: `rotate(${sliceRotation}deg)`,
              }}
            ></div>
          </div>
        );
      })}
      <div className="donut-hole"></div> {/* 중앙에 구멍 추가 */}
    </div>
  );
};

// 색상 배열을 통해 slice에 색상을 동적으로 할당
const getColor = (index: number): string => {
  const colors = ["#8bc34a", "#ff9800", "#2196f3", "#f44336"];
  return colors[index % colors.length];
};

export default DonutChart;
