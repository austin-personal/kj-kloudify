import React, { useState } from "react";
import "./Services.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { deploy } from "../../services/terraforms";

interface ServicesProps {
  nodes: Node[]; // Node 타입의 배열로 정의
  cid: number;
}

interface Node {
  id: string;
  type?: string;
  position: {
    x: number;
    y: number;
  };
  data?: {
    label?: string;
    [key: string]: any;
  };
  style?: React.CSSProperties;
}

const Services: React.FC<ServicesProps> = ({ nodes, cid }) => {
  // 모달 열림 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token") ?? "";

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const handleDisabledBtn = () => {
    return !isChecked;
  };

  const handleDeploy = async () => {
    try {
      // deploy 함수 호출 (딱히 반환값을 사용하지 않으므로 await로만 호출)
      const response = await deploy(cid, token);
      console.log(response);
      console.log("배포가 성공적으로 시작되었습니다.");

      // 세션 스토리지에서 노드 정보 삭제
      sessionStorage.removeItem("nodes");

      // 페이지 이동
      navigate("/profile");
    } catch (error) {
      console.error("배포 중 오류 발생:", error);
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
        {nodes.map((node) => (
          <div key={node.id}>
            {node.data && node.type === "position-logger" && (
              <>
                <div className="service-element">
                  <img
                    src={node.data.imgUrl}
                    alt="ec2"
                    className="service-image"
                  />
                  <span className="service-label">{node.data.label}</span>
                  <span className="price-label">$9/per month</span>
                </div>
              </>
            )}
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
                <p>
                  물론! 여기 500자 정도의 텍스트를 만들어봤어. 어느 날, 하늘을
                  바라보며 생각에 잠긴 나는 구름이 얼마나 아름다운지 새삼
                  깨달았다. 구름은 끊임없이 모양을 바꾸며 떠다니고, 그 안에는
                  수많은 이야기들이 담겨 있는 것 같았다. 내가 자주 가는 공원
                  벤치에 앉아, 책 한 권을 펴 들고 조용히 구름을 바라보는 시간이
                  얼마나 소중한지 느껴졌다. 그 순간을 놓치지 않기 위해 핸드폰을
                  꺼내 사진을 찍었지만, 구름의 모습은 눈으로 직접 보는 것과는
                  사뭇 달랐다. 그제서야 나는 구름을 보고 느끼는 감정이
                  사진으로는 완전히 전달될 수 없다는 걸 알게 되었다. 자연의
                  아름다움은 그 순간에 직접 느껴야만 하는 감각일지도 모른다.
                  책을 읽으면서도 내 마음은 하늘로 향해 있었다. 구름은 시간이
                  지나면 사라지지만, 그 기억은 오래오래 내 안에 남아 있기를
                  바랐다. 물론! 여기 500자 정도의 텍스트를 만들어봤어. 어느 날,
                  하늘을 바라보며 생각에 잠긴 나는 구름이 얼마나 아름다운지 새삼
                  깨달았다. 구름은 끊임없이 모양을 바꾸며 떠다니고, 그 안에는
                  수많은 이야기들이 담겨 있는 것 같았다. 내가 자주 가는 공원
                  벤치에 앉아, 책 한 권을 펴 들고 조용히 구름을 바라보는 시간이
                  얼마나 소중한지 느껴졌다. 그 순간을 놓치지 않기 위해 핸드폰을
                  꺼내 사진을 찍었지만, 구름의 모습은 눈으로 직접 보는 것과는
                  사뭇 달랐다. 그제서야 나는 구름을 보고 느끼는 감정이
                  사진으로는 완전히 전달될 수 없다는 걸 알게 되었다. 자연의
                  아름다움은 그 순간에 직접 느껴야만 하는 감각일지도 모른다.
                  책을 읽으면서도 내 마음은 하늘로 향해 있었다. 구름은 시간이
                  지나면 사라지지만, 그 기억은 오래오래 내 안에 남아 있기를
                  바랐다.
                </p>
              </div>
              <button className="close-btn" onClick={toggleModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="info-notice">
        <FontAwesomeIcon
          icon={faCircleExclamation}
          size="2xl"
          style={{ color: "#E37E7E" }}
        />
        <h3 className="info-title">배포 전 마지막 단계</h3>
      </div>

      <p className="info-contents">배포를 위한 AWS 관련 정보가 필요합니다.</p>
      <div className="right-btn">
        <button className="info-btn" onClick={handleGuide}>
          정보 입력하러 가기 →
        </button>
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
        <button
          className="deploy-btn"
          onClick={handleDeploy}
          disabled={handleDisabledBtn()}
        >
          Deploy
        </button>
      </div>
    </div>
  );
};

export default Services;
