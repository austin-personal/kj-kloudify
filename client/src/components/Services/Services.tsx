import React, { useState } from "react";
import "./Services.css";
import { useNavigate } from "react-router-dom";
const Services: React.FC = () => {
  // 모달 열림 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const handleDeploy = () => {
    navigate("/profile");
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
        <span className="service-label">서비스</span>
        <span className="price-label">예상 비용</span>
      </div>
      <hr />
      <div className="service-container">
        <div className="service-element">
          <img
            src="https://icon.icepanel.io/AWS/svg/Compute/EC2.svg"
            alt="ec2"
            className="service-image"
          />
          <span className="service-label">RDS</span>
          <span className="price-label">$9</span>
        </div>
        <div className="service-element">
          <img
            src="https://icon.icepanel.io/AWS/svg/Compute/EC2.svg"
            alt="ec2"
            className="service-image"
          />
          <span className="service-label">RDS</span>
          <span className="price-label">$9</span>
        </div>
        <div className="service-element">
          <img
            src="https://icon.icepanel.io/AWS/svg/Compute/EC2.svg"
            alt="ec2"
            className="service-image"
          />
          <span className="service-label">RDS</span>
          <span className="price-label">$9</span>
        </div>
        <div className="service-element">
          <img
            src="https://icon.icepanel.io/AWS/svg/Compute/EC2.svg"
            alt="ec2"
            className="service-image"
          />
          <span className="service-label">RDS</span>
          <span className="price-label">$9</span>
        </div>
      </div>
      <div className="middle-btn">
        <button className="price-summary-btn" onClick={toggleModal}>
          Price Summary
        </button>
        {/* 모달이 열려 있을 때만 모달 컴포넌트 보여주기 */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Price Summary Details</h2>
              <p>This is the content of the modal window.</p>
              <button className="close-btn" onClick={toggleModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <hr />
      <h3>배포 전 마지막 단계</h3>
      <p>배포를 위한 AWS 관련 정보가 필요합니다.</p>
      <div className="right-btn">
        <button className="info-btn" onClick={handleGuide}>
          정보 입력하러 가기 →
        </button>
      </div>
      <div className="right-btn">
        <button onClick={handleDeploy}>Deploy</button>
      </div>
    </div>
  );
};

export default Services;
