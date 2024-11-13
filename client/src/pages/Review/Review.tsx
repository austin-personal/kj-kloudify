// Review.tsx
import React, { useRef, useState, useEffect } from "react";
import Services from "../../components/Services/Services";
import Toast from "../../components/Toast/Toast";
import CodeBlock from "../../components/CodeBlock/CodeBlock";
import CodeBlockLoading from "../../components/CodeBlock/CodeBlockLoading";
import "./Review.css";
import { Icon } from "@iconify/react";
import { download, terraInfo } from "../../services/terraforms";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import MermaidChart from "../../components/Mermaid/mermaid";
import { setHasSecret } from "../../store/loadingSlice";
import { projectDeployedInfo } from "../../services/projects";
import { info } from "../../services/users";
const domtoimage = require("dom-to-image");

const Review: React.FC = () => {
  const dispatch = useAppDispatch();
  const isReviewReady = useAppSelector((state) => state.loading.isReviewReady);
  const finishData = useAppSelector((state) => state.finishData.finishData);
  const terraData = useAppSelector((state) => state.terraInfo.data);
  const { cid: cidParam } = useParams<{ cid: string }>();
  const { pid: pidParam } = useParams<{ pid: string }>();
  const cid = cidParam ? parseInt(cidParam, 10) : null;
  const pid = pidParam ? parseInt(pidParam, 10) : null;
  const [showToast, setShowToast] = useState(true);
  const mermaidRef = useRef<HTMLDivElement>(null); // MermaidChart 요소를 참조할 ref 추가
  const [isTerraformVisible, setIsTerraformVisible] = useState(false);
  const navigate = useNavigate();
  dispatch(setHasSecret(true));

  const handleCheckboxChange = () => {
    setIsTerraformVisible(!isTerraformVisible); // 상태 토글
  };

  const handleScreenshot = async () => {
    if (mermaidRef.current) {
      // div 요소를 PNG 이미지로 변환
      domtoimage
        .toPng(mermaidRef.current)
        .then((dataUrl: string) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "capture.png";
          link.click();
        })
        .catch((error: any) => {
        });
    }
  };

  const handleDownload = async () => {
    if (cid !== null) {
      try {
        const data = await download(cid);
        const blob = new Blob([data], { type: "text/plain" });
        const fileURL = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = fileURL;
        link.download = `terraform_code_${cid}.tf`;
        link.click();

        URL.revokeObjectURL(fileURL);
      } catch (error) {
      }
    }
  };

  useEffect(() => {
    const checkDeploymentStatus = async () => {
      try {
        const userInfo = await info();
        const deployedData = (await projectDeployedInfo(userInfo.user.email)).data;

        // cidParam과 일치하는 CID 항목을 찾음
        const matchingProject = deployedData.find(
          (project: { CID: number; isDeployed: boolean }) => project.CID === cid
        );

        // 일치하는 프로젝트가 있고, isDeployed가 true인 경우
        if (matchingProject && matchingProject.isDeployed) {
          navigate("/profile");
        }
      } catch (error) {
        navigate(-1); // 에러 발생 시 이전 페이지로 이동
      }
    };

    checkDeploymentStatus();
  }, [cidParam, navigate]);

  return (
    <div className="review">
      <div className="review-board">
        <div className="container">
          <input
            type="checkbox"
            className="checkbox"
            id="checkbox"
            onChange={handleCheckboxChange}
          />
          <label className="switch" htmlFor="checkbox">
            <span className="slider">
              <Icon
                icon={isTerraformVisible ? "jam:sitemap" : "mdi:code-braces"}
                width="27"
                color="#312D26"
              />
            </span>
          </label>
          <span className="notice-tooltip">
            {isTerraformVisible ? "Architecture Image" : "Terraform Code"}
          </span>
        </div>
        <div className="download">
          {isReviewReady ? (
            <button
              className={`download-button ${isTerraformVisible ? "terraform-btn" : "default-btn"
                }`}
              onClick={isTerraformVisible ? handleDownload : handleScreenshot}
            >
              <svg
                className="svgIcon"
                viewBox="0 0 384 512"
                height="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
              </svg>
              <span className="icon2"></span>
              <span className="download-tooltip">
                {isTerraformVisible ? "Terratorm Download" : "Image Download"}
              </span>
            </button>
          ) : (
            <button
              className={`download-button loading ${isTerraformVisible ? "terraform-btn" : "default-btn"
                }`}
              disabled
            >
              <div className="spinner"></div>

              <div className="tooltip">환경 설정중입니다. 기다려 주세요.</div>
            </button>
          )}
        </div>
        {isTerraformVisible ? (
          <div className="terraform-code">
            <div className="terraform-frame">
              <div className="terraform-container">
                {isReviewReady ? (
                  <CodeBlock code={terraData} className="code" />
                ) : (
                  <CodeBlockLoading />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div ref={mermaidRef} className="mermaid-chart">
            <MermaidChart chartCode={finishData} />
          </div>
        )}
      </div>

      <div className="vertical-line"></div>
      <Services
        cid={cid ?? 0}
        pid={pid ?? 0}
        isReviewReady={isReviewReady}
      />
      <div>
        {showToast && (
          <Toast
            message={
              isReviewReady
                ? "생성이 완료되었습니다.\n이제 배포할 준비가 되었습니다!"
                : "테라폼 코드 생성 중입니다...\n잠시만 기다려주세요."
            }
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Review;
