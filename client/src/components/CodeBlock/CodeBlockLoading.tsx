// Loading.tsx
import React from "react";
import Lottie from "lottie-react";
import Loadinganimation from "./TerraformLoadingAnimation.json";
import "./CodeBlockLoading.css";
const CodeblockLoading: React.FC = () => {
  return (
    <div className="terraform-loading-page">
      <div className="terraform-loading-banner">
        <div className="terraform-loading-text">
          <h3>잠시만 기다려 주세요, 테라폼 생성 중입니다.</h3>
        </div>
      </div>
      <Lottie
        animationData={Loadinganimation}
        style={{ width: "350px", height: "350px" }}
      />
    </div>
  );
};

export default CodeblockLoading;
