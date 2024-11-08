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
            <Lottie animationData={Loadinganimation} style={{width: "200px", height: "200px"}}/>
        </div>
    );
};

export default Loading;
