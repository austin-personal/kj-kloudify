import React from "react";
import "./KeyForm.css";

interface KeyFormProps {
  keyId: string;
  setKeyId: React.Dispatch<React.SetStateAction<string>>;
  secretKey: string;
  setSecretKey: React.Dispatch<React.SetStateAction<string>>;
  region: string;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
}

const KeyForm: React.FC<KeyFormProps> = ({
  keyId,
  setKeyId,
  secretKey,
  setSecretKey,
  region,
  setRegion,
}) => {
  // AWS 리전 목록
  const regions = [
    { label: "미국 동부 (버지니아 북부)", value: "us-east-1" },
    { label: "미국 동부 (오하이오)", value: "us-east-2" },
    { label: "미국 서부 (캘리포니아)", value: "us-west-1" },
    { label: "미국 서부 (오레곤)", value: "us-west-2" },
    { label: "아시아 태평양 (뭄바이)", value: "ap-south-1" },
    { label: "아시아 태평양 (오사카)", value: "ap-northeast-3" },
    { label: "아시아 태평양 (서울)", value: "ap-northeast-2" },
    { label: "아시아 태평양 (싱가포르)", value: "ap-southeast-1" },
    { label: "아시아 태평양 (시드니)", value: "ap-southeast-2" },
    { label: "아시아 태평양 (도쿄)", value: "ap-northeast-1" },
    { label: "캐나다 (중부)", value: "ca-central-1" },
    { label: "유럽 (프랑크푸르트)", value: "eu-central-1" },
    { label: "유럽 (아일랜드)", value: "eu-west-1" },
    { label: "유럽 (런던)", value: "eu-west-2" },
    { label: "유럽 (파리)", value: "eu-west-3" },
    { label: "유럽 (스톡홀름)", value: "eu-north-1" },
    { label: "남아메리카 (상파울루)", value: "sa-east-1" },
    { label: "아프리카 (케이프타운)", value: "af-south-1" },
    { label: "아시아 태평양 (홍콩)", value: "ap-east-1" },
    { label: "아시아 태평양 (하이데라바드)", value: "ap-south-2" },
    { label: "아시아 태평양 (자카르타)", value: "ap-southeast-3" },
    { label: "아시아 태평양 (말레이시아)", value: "ap-southeast-5" },
    { label: "아시아 태평양 (멜버른)", value: "ap-southeast-4" },
    { label: "캐나다 (캘거리)", value: "ca-west-1" },
    { label: "유럽 (밀라노)", value: "eu-south-1" },
    { label: "유럽 (스페인)", value: "eu-south-2" },
    { label: "유럽 (취리히)", value: "eu-central-2" },
    { label: "중동 (바레인)", value: "me-south-1" },
    { label: "중동 (아랍에미리트)", value: "me-central-1" },
    { label: "이스라엘 (텔아비브)", value: "il-central-1" },
  ];

  return (
    <div className="key-form">
      <div className="top-key-form-th">
        <div className="input-box">
          <div className="color-font-th">AWS_ACCESS_KEY_ID</div>
          <input
            type="text"
            placeholder="ex)ABCD1234ABCD1234"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
          />
        </div>
        <div className="input-box">
          <div className="color-font-th">AWS_SECRET_ACCESS_KEY</div>
          <input
            type="text"
            placeholder="ex)ABCD1234ABCD1234"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
          />
        </div>
        <div className="input-box">
          <div className="color-font-th">AWS_REGION</div>
          <select
            className="select-box"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="" disabled>
              리전을 선택하세요
            </option>
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default KeyForm;
