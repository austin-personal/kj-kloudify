import React, { useState } from "react";
import "./Guide.css";
import GuideForm from "../../components/GuidePage/GuideForm";
import KeyForm from "../../components/GuidePage/KeyForm";
import { createSecret } from "../../services/secrets";
import { useNavigate } from "react-router-dom";

const Guide: React.FC = () => {
  const [keyId, setKeyId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [keyPair, setKeyPair] = useState("");
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const navigate = useNavigate();
  // 모든 조건을 체크하는 함수
  const isFormValid = () => {
    return keyId && secretKey && keyPair && isConsentChecked;
  };

  // submit 버튼 클릭 시 호출되는 함수
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("토큰이 존재하지 않습니다.");
      }
      const response = await createSecret(keyId, secretKey, keyPair, token); // token이 string임을 보장
      console.log(response);
    } catch (error) {
      console.log(error);
    }
    if (isFormValid()) {
      alert("성공!");
      navigate(-1);
    } else {
      alert("아직 안한게 있음");
    }
  };

  return (
    <div className="guide-page">
      <KeyForm
        keyId={keyId}
        setKeyId={setKeyId}
        secretKey={secretKey}
        setSecretKey={setSecretKey}
        keyPair={keyPair}
        setKeyPair={setKeyPair}
      />
      <div className="vertical-line"></div>
      <GuideForm
        isConsentChecked={isConsentChecked}
        setIsConsentChecked={setIsConsentChecked}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default Guide;
