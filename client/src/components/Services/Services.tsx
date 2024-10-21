import React from "react";
import "./Services.css";

const Services: React.FC = () => {
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
        <button className="price-summary-btn">Price Summary</button>
      </div>
      <hr />
      <h3>배포 전 마지막 단계</h3>
      <p>배포를 위한 AWS 관련 정보가 필요합니다.</p>
      <div className="right-btn">
        <button className="info-btn">정보 입력하러 가기 →</button>
      </div>
      <div className="right-btn">
        <button>Deploy</button>
      </div>
    </div>
  );
};

export default Services;
