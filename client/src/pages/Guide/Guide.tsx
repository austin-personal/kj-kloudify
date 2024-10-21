import React, { useState } from "react";
import './Guide.css'
import GuideForm from '../../components/GuidePage/GuideForm';
import KeyForm from '../../components/GuidePage/KeyForm'

const Guide: React.FC = () => {

    const [keyId, setKeyId] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [keyPair, setKeyPair] = useState('');
    const [isConsentChecked, setIsConsentChecked] = useState(false);

    // 모든 조건을 체크하는 함수
    const isFormValid = () => {
        return keyId && secretKey && keyPair && isConsentChecked;
    }

    // submit 버튼 클릭 시 호출되는 함수
    const handleSubmit = () => {
        if (isFormValid()) {
            alert('성공!');
        } else {
            alert('아직 안한게 있음');
        }
    }

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
            <GuideForm 
                isConsentChecked={isConsentChecked}
                setIsConsentChecked={setIsConsentChecked}
                handleSubmit={handleSubmit}
            />
        </div>
    )
}

export default Guide;