import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import PriceCalculatingAnimation from "./PriceCalculatingAnimation.json";
import { Icon } from "@iconify/react";
import "./Services.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading, setReviewReady } from "../../store/loadingSlice";
import { deploy, destroy, review, terraInfo } from "../../services/terraforms";
import { projectSummary, projectPrice } from "../../services/projects";
import { fetch } from "../../services/conversations";
import { extractServiceName } from "../../utils/awsServices";
import showAlert from "../../utils/showAlert";
import { setData } from "../../store/dataSlice";

interface ServicesProps {
  cid: number;
  pid: number;
  isReviewReady: boolean;
}

const Services: React.FC<ServicesProps> = ({
  cid,
  pid,
  isReviewReady,
}) => {
  // 모달 열림 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [serviceNames, setServiceNames] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [priceResponse, setPriceResponse] = useState<any>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getImagePath = (name: string) => {
    try {
      const serviceName = extractServiceName(name);
      return require(`../../img/aws-icons/${serviceName}.svg`);
    } catch (error) {
      return require(`../../img/aws-icons/default.svg`).default; // 기본 이미지 경로 설정
    }
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      if (serviceNames && summary) return; // 이미 데이터가 있으면 요청 안함
      try {
        const ServiceNameResponse = await fetch(cid);
        setServiceNames(ServiceNameResponse);

        const SummaryResponse = await projectSummary(cid);
        if (SummaryResponse && typeof SummaryResponse.text === "string") {
          const parsedSummary = JSON.parse(SummaryResponse.text);
          setSummary(parsedSummary.aws_services); // aws_services 객체만 저장
        } else {
          setSummary(SummaryResponse);
        }
      } catch (error) {
      }
    };

    // 데이터를 불러올 필요가 있는 경우에만 fetchProjectData 호출
    fetchProjectData();
  }, [cid]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const handleDisabledBtn = () => {
    return !isChecked;
  };

  const handleDeploy = async () => {
    try {
      dispatch(setLoading(true));
      // deploy 함수 호출 (딱히 반환값을 사용하지 않으므로 await로만 호출)
      await deploy(cid);
      dispatch(setLoading(false));
      showAlert(
        "배포 성공!",
        "배포가 성공적으로 완료되어 Detail 페이지로 이동합니다.",
        "success"
      );
      navigate(`/detail/${pid}`);
    } catch (error) {
      await destroy(cid);
      console.log("탈출!")
      dispatch(setLoading(false));
      dispatch(setReviewReady(false));
      showAlert(
        "배포 실패!",
        "배포 중에 문제가 발생했습니다.리뷰창으로 돌아가서 다시 Deploy를 시도하세요.",
        "error"
      );
      console.log("review 호출!!")
      review(cid, Number(pid)).then(async ({ message, bool }) => {
        console.log("review 성공!!")
        dispatch(setReviewReady(true));
        if (!bool) {
          alert(message);
          navigate(`/home/${pid}`);
        } else {
          // review 성공 시 terraInfo 호출
          const data = await terraInfo(cid);
          dispatch(setData(data));
        }
      });
    }
  };

  const openModal = async () => {
    setIsModalOpen(true);
    if (priceResponse) return;
    try {
        const response = await projectPrice(cid);
        setPriceResponse(response);
    } catch (error) {
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeDeployModal = () => {
    setIsDeployModalOpen(false);
    navigate(`/detail/${pid}`);
  };

  const termsAndConditions: string = `
  **이용약관**
  
  제1조 (목적)
  본 약관은 당사("서비스 제공자")가 이용자("고객")를 대신하여 AWS 서비스를 배포하기 위해 필요한 AWS 접근 권한 정보의 제공에 관한 사항을 규정함을 목적으로 합니다.
  
  제2조 (정보 제공 동의)
  고객은 다음의 AWS 관련 정보 제공에 동의합니다:
  1. AWS_ACCESS_KEY_ID
  2. AWS_SECRET_ACCESS_KEY
  3. AWS_REGION
  4. Key Pair의 Public Key
  
  제3조 (정보의 사용 목적)
  수집된 정보는 고객을 대신하여 AWS 서비스를 배포하는 목적에만 사용되며, 그 외의 목적으로는 사용되지 않습니다.
  
  제4조 (정보의 보호)
  서비스 제공자는 고객의 AWS 접근 권한 정보를 안전하게 관리하며, 관련 법령에 따라 보호합니다. 해당 정보는 제3자에게 제공하거나 공개하지 않습니다.
  
  제5조 (동의 철회)
  고객은 언제든지 정보 제공 동의를 철회할 수 있으며, 이 경우 서비스 이용에 제한이 있을 수 있습니다.
  
  제6조 (문의)
  본 약관에 대한 문의는 당사 고객센터를 통해 접수하시기 바랍니다.
  
  **부칙**
  본 약관은 작성된 날로부터 효력이 발생합니다.
  `;

  return (
    <div className="services">
      <div className="price-summary-header">
        <span className="top-label-service">서비스</span>
        <span className="top-label-price">상세 정보</span>
        <button className="top-price-summary-btn" onClick={openModal}>
          Price Summary
        </button>
      </div>
      <div className="service-container">
        {serviceNames.map((item, index) => (
          <div key={index}>
            <div className="service-element">
              <div className="service-wrapper">
                <img
                  src={getImagePath(item)}
                  alt={item}
                  className="service-image"
                />
                <span className="service-label">{item}</span>
              </div>

              <div className="description-wrapper">
                <input
                  type="checkbox"
                  id={`toggle-${item}`}
                  className="toggle-checkbox"
                />

                {summary && summary[item] && summary[item].description ? (
                  <ul className="description-list">
                    {summary[item].description.map(
                      (desc: string, i: number) => (
                        <li key={i}>{desc}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <span className="description-list-loading">
                    <Icon
                      icon="svg-spinners:180-ring-with-bg"
                      color="#fdc36d"
                      width="32px"
                    />
                  </span>
                )}

                <label
                  htmlFor={`toggle-${item}`}
                  className="toggle-button"
                ></label>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="middle-btn">
        {/* 모달이 열려 있을 때만 모달 컴포넌트 보여주기 */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-container">
                {priceResponse &&
                  priceResponse.price &&
                  priceResponse.price.text ? (
                  <p>
                    {priceResponse.price.text.replace(/\[.*?\]/g, "").trim()}
                  </p>
                ) : (
                  <div className="calculating-container">
                    <p>가격 계산 중입니다...</p>
                    <Lottie
                      animationData={PriceCalculatingAnimation}
                      style={{ width: "350px", height: "350px" }}
                      className="calculating-animation"
                    />
                  </div>
                )}
              </div>
              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="terms-and-conditions">
        <div className="color-font-th">약관</div>
        <textarea className="consent-box" value={termsAndConditions} readOnly />
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
            className={`deploy-btn ${isChecked ? "" : "check"}`}
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
      {isDeployModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={closeDeployModal}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
