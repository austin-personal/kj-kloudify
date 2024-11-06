// Loading.tsx
import React from "react";
import "./Loading.css";
import Lottie from "lottie-react";
import Loadinganimation from "./LoadingAnimation.json"

const Loading: React.FC = () => {
    return (
        <div className="loading-page">
            <h4>배포중입니다</h4>
            <h4>시간이 오래 걸릴수 있으니 기다려주세요</h4>
            <Lottie animationData={Loadinganimation} />
        </div>
    );
};

export default Loading;
