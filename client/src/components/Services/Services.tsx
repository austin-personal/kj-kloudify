import React, { useState, useEffect } from "react";
import "./Services.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/loadingSlice";
import { deploy, review } from "../../services/terraforms";
import { checkSecret } from "../../services/secrets";
import { projectSummary, projectPrice } from "../../services/projects";
import { fetch } from "../../services/conversations";
import { extractServiceName } from "../../utils/awsServices";
interface ServicesProps {
  cid: number;
  pid: number;
  isReviewReady: boolean;
  chartCode: string[];
}

const Services: React.FC<ServicesProps> = ({
  cid,
  pid,
  isReviewReady,
  chartCode,
}) => {
  // 모달 열림 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [serviceNames, setServiceNames] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [priceResponse, setPriceResponse] = useState<any>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token") ?? "";
  const dispatch = useDispatch();

  const getImagePath = (name: string) => {
    try {
      // console.log("전:", name);
      const serviceName = extractServiceName(name);
      // console.log("후2:", serviceName);
      return require(`../../img/aws-icons/${serviceName}.svg`);
    } catch (error) {
      console.warn(`Image not found: ${name}. Using default image.`);
      return "https://icon.icepanel.io/AWS/svg/Compute/EC2.svg"; // 기본 이미지 경로 설정
    }
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      if (serviceNames && summary) return; // 이미 데이터가 있으면 요청 안함

      try {
        if (token) {
          const ServiceNameResponse = await fetch(cid, token);
          setServiceNames(ServiceNameResponse);
          console.log("서비스 배열", ServiceNameResponse);

          const SummaryResponse = await projectSummary(cid, token);
          if (SummaryResponse && typeof SummaryResponse.text === "string") {
            const parsedSummary = JSON.parse(SummaryResponse.text);
            setSummary(parsedSummary.aws_services); // aws_services 객체만 저장
          } else {
            setSummary(SummaryResponse);
          }
          console.log("요약", SummaryResponse);
        } else {
          console.error("토큰이 없습니다. 인증 문제가 발생할 수 있습니다.");
        }
      } catch (error) {
        console.error("프로젝트 summary를 가져오는 중 오류 발생:", error);
      }
    };

    // 데이터를 불러올 필요가 있는 경우에만 fetchProjectData 호출
    fetchProjectData();
  }, [cid, token]);

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
      alert("배포 성공! detail 페이지로 이동합니다.");
      navigate(`/detail/${pid}`);
    } catch (error) {
      alert("배포 실패! 리뷰창으로 돌아갑니다. 다시 Deploy를 시도하세요.");
      await review(cid, pid, token);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const openModal = async () => {
    setIsModalOpen(true);
    if (priceResponse) return;
    try {
      if (token) {
        const response = await projectPrice(cid, token);
        setPriceResponse(response);
        console.log("PriceResponse", response);
      }
    } catch (error) {
      console.error("프로젝트 price를 가져오는 중 오류 발생:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
              <img
                src={getImagePath(item)}
                alt="ec2"
                className="service-image"
              />
              <span className="service-label">{item}</span>
              {/* 서비스 상세정보 라벨 대체 */}
              {summary && summary[item] ? (
                <div className="price-label">
                  <h3>{summary[item].title}</h3>
                  <ul>
                    {summary[item].description.map(
                      (desc: string, i: number) => (
                        <li key={i}>{desc}</li>
                      )
                    )}
                  </ul>
                </div>
              ) : (
                <span className="price-label">loading...</span>
              )}
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
                {priceResponse &&
                priceResponse.price &&
                priceResponse.price.text ? (
                  <p>{priceResponse.price.text}</p>
                ) : (
                  <p>Loading...</p>
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
