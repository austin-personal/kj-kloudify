// Loading.tsx
import React from "react";
import "./Loading.css";
import Lottie from "lottie-react";
import Loadinganimation from "./LoadingAnimation.json"

const Loading: React.FC = () => {
    return (
        <div className="loading-page">
            <div className="loading-banner">
                <div className="loading-text"><h3>잠시만 기다려 주세요, 서비스 배포 중입니다. 조금만 기다려 주세요!</h3></div>
            </div>
            <Lottie animationData={Loadinganimation} style={{ width: "350px", height: "350px" }} />
            <h4>⚠️ 경고: 배포 중단 위험!

                현재 프로젝트가 배포 중입니다. 배포 작업이 끝나지 않은 상태에서 나가면 배포가 불완전하거나 실패할 수 있습니다. 완료될 때까지 기다려 주세요.</h4>
        </div>
    );
};

export default Loading;
