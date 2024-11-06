// Loading.tsx
import React from "react";
import "./Loading.css";
import Lottie from "lottie-react";
import Loadinganimation from "./LoadingAnimation.json"

const Loading: React.FC = () => {
    return (
        <div className="loading-page">
            <p>Loading...</p>
            <Lottie animationData={Loadinganimation} />
        </div>
    );
};

export default Loading;
