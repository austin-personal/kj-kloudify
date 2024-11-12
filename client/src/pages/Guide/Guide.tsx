import React, { useState } from "react";
import "./Guide.css";
import GuideForm from "../../components/GuidePage/GuideForm";
import KeyForm from "../../components/GuidePage/KeyForm";
import { createSecret } from "../../services/secrets";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import showAlert from "../../utils/showAlert";
const Guide: React.FC = () => {
  const [keyId, setKeyId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [region, setRegion] = useState("");

  const navigate = useNavigate();

  // 암호화 키 (서버와 클라이언트가 공유해야 함)
  const ENCRYPTION_KEY = "your-shared-secret-key";

  // 암호화 함수
  const encryptData = (data: string) => {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  };

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
      // AWS credentials을 암호화하여 전송
      const encryptedKeyId = encryptData(keyId);
      const encryptedSecretKey = encryptData(secretKey);
      const encryptedRegion = encryptData(region);

      const response = await createSecret(keyId, secretKey, region, token); // token이 string임을 보장
      console.log(response);
    } catch (error) {
      console.log(error);
    }
    if (isFormValid()) {
      showAlert("제출 완료", "AWS 키가 성공적으로 제출되었습니다.", "success");
      navigate(-1);
    } else {
      showAlert(
        "제출 실패",
        "아직 입력되지 않은 AWS 키가 있습니다.",
        "warning"
      );
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
      <div className="vertical-line-guide-th"></div>
      <GuideForm handleSubmit={handleSubmit} />
    </div>
  );
};

export default Guide;
