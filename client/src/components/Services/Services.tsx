import React, { useState, useEffect } from "react";
import "./Services.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/loadingSlice";
import { deploy } from "../../services/terraforms";
import { checkSecret } from "../../services/secrets";
import { projectSummary } from "../../services/projects";

interface ServicesProps {
  cid: number;
  isReviewReady: boolean;
  chartCode: string[];
}

const Services: React.FC<ServicesProps> = ({
  cid,
  isReviewReady,
  chartCode,
}) => {
  // 모달 열림 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token") ?? "";
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (token) {
          const response = await projectSummary(cid, token);
          console.log(response);
        } else {
          console.error("토큰이 없습니다. 인증 문제가 발생할 수 있습니다.");
        }
      } catch (error) {
        console.error("프로젝트 정보를 가져오는 중 오류 발생:", error);
      }
    };

    fetchProjectData();
  }, [cid, navigate]);

  const getImagePath = (name: string) => {
    try {
      return require(`../../img/aws-icons/${name}.svg`);
    } catch (error) {
      console.warn(`Image not found: ${name}. Using default image.`);
      return "https://icon.icepanel.io/AWS/svg/Compute/EC2.svg"; // 기본 이미지 경로 설정
    }
  };
  //서비스 이름 추출
  let filteredMatches: string[] = [];

  let serviceNames: string[] = [];
  if (chartCode) {
    const result = chartCode.map((code) => {
      // 양 끝에 있는 대괄호 제거
      return code.replace(/^\[|\]$/g, "");
    });
    const chartString = result[0];
    const serviceNames = Array.from(
      chartString.matchAll(/(\b\w+)(?=\s*\[<img\s)/g)
    ).map((match) => match[1]);
    // console.log("서비스 이름:", serviceNames);

    // `사용자` 또는 `client` 키워드를 포함하지 않는 항목만 필터링
    filteredMatches = serviceNames.filter(
      (item) =>
        !item.includes("사용자") && !item.toLowerCase().includes("client")
    );
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
      await deploy(cid, token);
      alert("배포성공");
      navigate("/profile");
    } catch (error) {
      alert("배포실패");
      navigate(-1);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // 모달 열고 닫는 함수
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="services">
      <div className="price-summary-header">
        <span className="top-label-service">서비스</span>
        <span className="top-label-price">상세 정보</span>
        <button className="top-price-summary-btn" onClick={toggleModal}>
          Price Summary
        </button>
      </div>
      <div className="service-container">
        {filteredMatches.map((item, index) => (
          <div key={index}>
            <div className="service-element">
              <img
                src={getImagePath(item)}
                alt="ec2"
                className="service-image"
              />
              <span className="service-label">{item}</span>
              <span className="price-label">블라블라블라블라</span>
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
