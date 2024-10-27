import React from "react";
import "./KeyForm.css";

interface KeyFormProps {
  keyId: string;
  setKeyId: React.Dispatch<React.SetStateAction<string>>;
  secretKey: string;
  setSecretKey: React.Dispatch<React.SetStateAction<string>>;
  keyPair: string;
  setKeyPair: React.Dispatch<React.SetStateAction<string>>;
  region: string;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
}

const KeyForm: React.FC<KeyFormProps> = ({
  keyId,
  setKeyId,
  secretKey,
  setSecretKey,
  keyPair,
  setKeyPair,
  region,
  setRegion,
}) => {
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
          <input
            type="text"
            placeholder="ex)ap-northeast-2"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>
      </div>
      <hr className="keyForm-line" />
      <div className="bottom-key-form-th">
        <div className="input-box">
          <div className="color-font-th">Key pairs</div>
          <input
            type="text"
            placeholder="ex)배포에 필요한 공개 키 정보"
            value={keyPair}
            onChange={(e) => setKeyPair(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default KeyForm;
