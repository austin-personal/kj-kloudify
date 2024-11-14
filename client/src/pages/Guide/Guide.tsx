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
  async function encryptData(data, publicKeyPem) {
    // PEM 헤더와 푸터 제거 및 공백 제거
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = publicKeyPem
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\r?\n|\r/g, '')  // 모든 줄 바꿈 제거
      .trim();
      console.log("암호화 함수 - 변환된 공개 키:\n", publicKeyPem);
      console.log("암호화 함수 - PEM 내용:\n", pemContents);
    // Base64 디코딩 및 Uint8Array 변환
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
    // 공개 키 가져오기
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      binaryDer.buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
    console.log("암호화 함수 - 공개 키 가져오기 성공:", publicKey);
    // 데이터 인코딩
    const encodedData = new TextEncoder().encode(data);
    console.log("암호화 함수 - 인코딩된 데이터:", encodedData);
    // 데이터 암호화
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      encodedData
    );
  
    // 암호화된 데이터를 Base64로 인코딩하여 반환
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    console.log("암호화 함수 - 암호화된 데이터 (Base64):", encryptedBase64);
    return encryptedBase64;
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

      const encryptedKeyId = await encryptData(keyId, publicKey);
      const encryptedSecretKey = await encryptData(secretKey, publicKey);
      const encryptedRegion = await encryptData(region, publicKey);

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
