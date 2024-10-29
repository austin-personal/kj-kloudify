import React, { useState } from "react";
import "./Guide.css";
import GuideForm from "../../components/GuidePage/GuideForm";
import KeyForm from "../../components/GuidePage/KeyForm";
import { createSecret } from "../../services/secrets";
import { useNavigate } from "react-router-dom";

const Guide: React.FC = () => {
  const [keyId, setKeyId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [region, setRegion] = useState("");
  
  const navigate = useNavigate();
  // 모든 조건을 체크하는 함수
  const isFormValid = () => {
    return keyId && secretKey && region;
  };

  // submit 버튼 클릭 시 호출되는 함수
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("토큰이 존재하지 않습니다.");
      }
      const response = await createSecret(
        keyId,
        secretKey,
        region,
        token
      ); // token이 string임을 보장
      console.log(response);
    } catch (error) {
      console.log(error);
    }
    if (isFormValid()) {
      alert("성공!");
      navigate(-1);
    } else {
      alert("아직 입력하지 않은 정보가 있습니다.");
    }
  };

  return (
    <div className="guide-page">
      <KeyForm
        keyId={keyId}
        setKeyId={setKeyId}
        secretKey={secretKey}
        setSecretKey={setSecretKey}
        region={region}
        setRegion={setRegion}
      />
      <div className="vertical-line"></div>
      <GuideForm handleSubmit={handleSubmit} />
    </div>
  );
};

export default Guide;
