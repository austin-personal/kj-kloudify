// Loading.tsx
import React from "react";
import "./Loading.css";
import Lottie from "lottie-react";
import Loadinganimation from "./LoadingAnimation.json"

const Loading: React.FC = () => {
    return (
        <div className="loading-page">
            <h3>⚠️ 주의: RDS 인스턴스 배포 중</h3>
            <p>RDS 서비스 배포에는 수 분에서 최대 수십 분까지 시간이 소요될 수 있습니다.</p>
            <p>설정과 초기화가 완료될 때까지 기다려 주시기 바랍니다. 완료 전까지는 데이터베이스 연결이 불가능할 수 있습니다.</p>
            <Lottie animationData={Loadinganimation} />
        </div>
    );
};

export default Loading;
