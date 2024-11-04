import React, { useState } from "react";
import "./Services.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/loadingSlice";
import { deploy } from "../../services/terraforms";
import { checkSecret } from "../../services/secrets";

interface ServicesProps {
  cid: number;
  isReviewReady: boolean;
}

const Services: React.FC<ServicesProps> = ({ cid, isReviewReady }) => {
  // 모달 열림 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token") ?? "";
  const dispatch = useDispatch();
  const data = localStorage.getItem("finishData");
  //서비스 이름 추출
  let filteredMatches: string[] = [];
  if (data) {
    const reData = JSON.parse(data);

    const chartString = `${reData
      .map(
        (code: string) =>
          `${code.replace(/^\[|\]$/g, "").replace(/;/g, "\n  ")}`
      )
      .join("\n  ")}`;
    console.log(chartString);
    // `[]` 안의 문자열 추출
    const matches = Array.from(chartString.matchAll(/\[(.*?)\]/g)).map(
      (match) => match[1]
    );
    console.log(matches);
    // `사용자` 또는 `client` 키워드를 포함하지 않는 항목만 필터링
    filteredMatches = matches.filter(
      (item) =>
        !item.includes("사용자") && !item.toLowerCase().includes("client")
    );
    console.log(filteredMatches);
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const handleDisabledBtn = () => {
    return !isChecked;
  };

  const handleDeploy = async () => {
    try {
      const hasCredentials = await checkSecret(token);
      if (!hasCredentials) {
        alert("AWS 자격 증명 정보를 입력해야 합니다.");
        navigate("/guide");
        return;
      }

      dispatch(setLoading(true));

      // deploy 함수 호출 (딱히 반환값을 사용하지 않으므로 await로만 호출)
      const response = await deploy(cid, token);
      console.log(response);
      console.log("배포가 성공적으로 시작되었습니다.");

      // 세션 스토리지에서 노드 정보 삭제
      sessionStorage.removeItem("nodes");
      navigate("/profile");
    } catch (error) {
      console.error("배포 중 오류 발생:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGuide = () => {
    navigate("/guide");
  };
  // 모달 열고 닫는 함수
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="services">
      <div className="price-summary-header">
        <span className="top-label-service">서비스</span>
        <span className="top-label-price">예상 비용</span>
        <button className="top-price-summary-btn" onClick={toggleModal}>
          Price Summary
        </button>
      </div>
      <div className="service-container">
        {filteredMatches.map((item, index) => (
          <div key={index}>
            <div className="service-element">
              <img
                src="https://icon.icepanel.io/AWS/svg/Compute/EC2.svg"
                alt="ec2"
                className="service-image"
              />
              <span className="service-label">{item}</span>
              <span className="price-label">$9/per month</span>
            </div>
          </div>
        ))}
      </div>
      <div className="middle-btn">
        {/* 모달이 열려 있을 때만 모달 컴포넌트 보여주기 */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Price Summary Details</h2>
              <div className="modal-container">
                <p>ㅎㅇ</p>
              </div>
              <button className="close-btn" onClick={toggleModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="terms-and-conditions">
        <div className="color-font-th">약관</div>
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
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="consent-checkbox" className="consent-label">
            개인 정보 수집 및 이용에 동의합니다
          </label>
        </div>
      </div>
      <div className="middle-btn">
        {isReviewReady ? (
          <button
            className="deploy-btn"
            onClick={handleDeploy}
            disabled={handleDisabledBtn()}
          >
            Deploy
          </button>
        ) : (
          <button className="loading-btn" disabled>
            <div className="spinner"></div>
            <div className="tooltip">아직 진행중입니다</div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Services;
