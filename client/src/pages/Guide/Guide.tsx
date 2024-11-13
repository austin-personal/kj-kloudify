import React, { useState } from "react";
import "./Guide.css";
import GuideForm from "../../components/GuidePage/GuideForm";
import KeyForm from "../../components/GuidePage/KeyForm";
import { createSecret, getPublicKey } from "../../services/secrets";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import showAlert from "../../utils/showAlert";
import { info } from "../../services/users";
import JSEncrypt from 'jsencrypt';

const Guide: React.FC = () => {
  const [keyId, setKeyId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [region, setRegion] = useState("");

  const navigate = useNavigate();

  // RSA 공개 키를 사용한 암호화 함수
  async function encryptData(data: string, publicKeyPem: string): Promise<string> {
    const binaryDerString = atob(publicKeyPem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''));
    const binaryDer = new Uint8Array(binaryDerString.split('').map(char => char.charCodeAt(0)));
  
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      binaryDer.buffer,
      {
        name: 'RSA-OAEP',
        hash: { name: 'SHA-256' },
      },
      true,
      ['encrypt']
    );
  
    const encodedData = new TextEncoder().encode(data);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      encodedData
    );
  
    return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  };

  // 모든 조건을 체크하는 함수
  const isFormValid = () => {
    return keyId && secretKey && region;
  };

  // submit 버튼 클릭 시 호출되는 함수
  const handleSubmit = async () => {
    try {
      if (!isFormValid()) {
        // 입력 값이 부족한 경우 경고 메시지 표시
        showAlert(
          "제출 실패",
          "아직 입력되지 않은 AWS 키가 있습니다.",
          "warning"
        );
        return; // 유효하지 않으면 함수 종료
      }

      const publicKey = await getPublicKey();
      // AWS credentials을 암호화하여 전송
      if (!publicKey) {
        throw new Error("공개 키를 가져오는 데 실패했습니다.");
      }

      const encryptedKeyId = encryptData(keyId, publicKey);
      const encryptedSecretKey = encryptData(secretKey, publicKey);
      const encryptedRegion = encryptData(region, publicKey);

      const response = await info(); 
      await createSecret(encryptedKeyId, encryptedSecretKey, encryptedRegion, response.user.email);

      showAlert("제출 완료", "AWS 키가 성공적으로 제출되었습니다.", "success");
      navigate(-1);

    } catch (error) {
      showAlert(
        "제출 실패",
        "오류가 발생했습니다. AWS 키를 다시 확인하거나 잠시 후 다시 제출해 주세요.",
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
