// Loading.tsx
import React, { useEffect } from "react";
import "./Loading.css";

const Loading: React.FC = () => {
    useEffect(() => {
        console.log("안녕");
    }, [])
    return (
        <div className="loading-page">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    );
};

export default Loading;
