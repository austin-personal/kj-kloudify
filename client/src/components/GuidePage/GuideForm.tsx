import React from "react";
import './GuideForm.css'

interface GuideFormProps {
    isConsentChecked: boolean;
    setIsConsentChecked: React.Dispatch<React.SetStateAction<boolean>>;
    handleSubmit: () => void;
}

const GuideForm: React.FC<GuideFormProps> = ({ isConsentChecked, setIsConsentChecked, handleSubmit }) => {
    return (
        <div className="guide-form">
            <div className="instruction">
                <h2>Guide</h2>
                <p className="guide-line">대충 가이드 내용이 엄청나게 무지하게 많이많이 이러쿵저러쿵 숄라숄라
                    김수한무거북이와두루미삼천갑자동방삭치치카포사리사리센타워리워리세브리깡무두셀라구름이허리케인에담벼락담벼락에서생원서생원에고양이고양이엔바둑이바둑이는돌돌이
                    아리랑 아리랑 아라리요 아리랑 고개를 넘어간다 날 버리고 가시는 님은 십리도 못가서 발병난다</p>
            </div>
            <div className="terms-and-conditions">
                <div>*약관*</div>
                <textarea
                    className="readonly-input"
                    value="대충 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEYU, AWS_REGION, key_pair Public key에 대한 정보 제공에 동의하냐는 내용의 약관 ..."
                    readOnly
                />
                <div className="consent-container">
                    <input
                        type="checkbox"
                        id="consent-checkbox"
                        className="consent-checkbox"
                        checked={isConsentChecked}
                        onChange={(e) => setIsConsentChecked(e.target.checked)}
                    />
                    <label htmlFor="consent-checkbox" className="consent-label">
                        I agree to the collection of my personal information
                    </label>
                </div>
            </div>
            <button className="submit" onClick={handleSubmit}>Submit</button>
        </div>
    )
}

export default GuideForm;