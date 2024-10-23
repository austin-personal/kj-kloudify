import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { projectAllInfo, deleteProject } from "../../services/projects";
import { deleteSecret } from "../../services/secrets";
import { info } from "../../services/users";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";

// 유저 프로필 타입 정의
interface UserProfile {
  UID: number;
  username: string;
  password: string;
  email: string;
}

// 프로젝트 타입 정의
interface Project {
  PID: number;
  CID: number;
  UID: number;
  ARCTID: number;
  projectName: string;
  createdDate: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>(""); // 모달 타입을 구분하는 상태
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          // 유저 정보 가져오기
          const userData = await info(token);
          setUserProfile(userData.user);

          // 유저의 프로젝트 리스트 가져오기
          const projectData = await projectAllInfo(token);
          setProjects(projectData.data); // 응답 데이터에 따라 수정 필요
        } else {
          // 토큰이 없으면 로그인 페이지로 이동
          navigate("/");
        }
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
      }
    };

    fetchData();
  }, [token, navigate]);

  if (!userProfile) return <div>Loading...</div>;

  const handleProjectClick = (PID: number) => {
    navigate(`/history/${PID}`);
  };
  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project); // project 객체 전체를 설정
    setModalType("deleteProject"); // 모달 타입 설정
    setShowDeleteModal(true); // 모달 띄우기
  };

  const handleAWSKeyDeleteClick = () => {
    setModalType("deleteAWSKey"); // 모달 타입 설정
    setShowDeleteModal(true); // 모달 띄우기
  };

  const handleConfirmDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("토큰이 존재하지 않습니다.");
    }

    if (modalType === "deleteProject" && projectToDelete) {
      // 프로젝트 삭제 로직
      await deleteProject(projectToDelete.PID, token);
      console.log(`Deleting project with PID: ${projectToDelete.PID}`);
      setProjects(projects.filter((p) => p.PID !== projectToDelete.PID));
    } else if (modalType === "deleteAWSKey") {
      // AWS Key 삭제 로직
      const response = await deleteSecret(token);
      console.log(response);
    }

    setShowDeleteModal(false);
    setProjectToDelete(null); // 초기화
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null); // 모달 닫기
  };
  return (
    <div className="profile-page">
      {/* 상단 프로필 섹션 */}
      <div className="profile-info">
        <div className="profile-text">
          <h2>{userProfile.username}</h2>
          <p>{userProfile.email}</p>
        </div>
        <div className="profile-button">
          <button
            className="AWS-Credential-deleteButton"
            onClick={(e) => {
              e.stopPropagation();
              handleAWSKeyDeleteClick();
            }}
          >
            AWS Key 삭제
          </button>
        </div>
      </div>
      <hr className="userProfile-line-th" />
      {/* 하단 프로젝트 리스트 섹션 */}
      <div className="project-list">
        <div className="project-list-name-th">프로젝트 리스트</div>
        {projects.map((project) => (
          <div
            key={project.PID}
            className="project-item"
            onClick={() => handleProjectClick(project.PID)} // 클릭 이벤트 핸들러 추가
          >
            <h3>{project.projectName}</h3>
            <p>{project.PID}</p>
            <small>{new Date(project.createdDate).toLocaleDateString()}</small>
            <button
              className="deleteButton"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(project);
              }}
            >
              <FontAwesomeIcon icon={faTrashCan} size="lg" className="svg" />
            </button>
          </div>
        ))}
      </div>
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>
              {modalType === "deleteProject"
                ? "프로젝트를 정말 삭제하시겠습니까?"
                : "AWS Key를 정말 삭제하시겠습니까?"}
            </h3>
            {modalType === "deleteProject" && (
              <p>프로젝트: {projectToDelete?.projectName}</p>
            )}
            <div className="delete-modal-buttons">
              <button
                className="delete-cancel-button"
                onClick={handleCancelDelete}
              >
                취소
              </button>
              <button
                className="delete-confirm-button"
                onClick={handleConfirmDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
