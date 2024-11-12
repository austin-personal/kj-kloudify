// Loading.tsx
import React from "react";
import "./Loading.css";
import Lottie from "lottie-react";
import Loadinganimation from "./LoadingAnimation.json"
import Loadingemoticon from "./LoadingEmo.json"

const Loading: React.FC = () => {
    return (
        <div className="loading-page">
            <div className="left-loading-page-th">
                <div className="loading-text">잠시만 기다려 주세요, 서비스 배포 중입니다. <br />조금만 기다려 주세요!</div>
                <Lottie className="deploy-cloud" animationData={Loadinganimation} style={{ width: "400px" }} />
            </div>
            <div className="right-loading-page-th">
                <h1>⚠️ 경고: 배포 중단 위험!</h1>
                <br />
                <br />
                <div className="alert-message">현재 프로젝트가 배포 중입니다. <br /> 배포 작업이 끝나지 않은 상태에서 나가면 <br /> 배포가 불완전하거나 실패할 수 있습니다. <br />완료될 때까지 기다려 주세요.</div>
                <Lottie animationData={Loadingemoticon} style={{ width: "300px" }}></Lottie>
            </div>
        </div>
    );
};

export default Loading;
