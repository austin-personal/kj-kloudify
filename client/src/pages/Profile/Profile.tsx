import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import {
  projectResumeInfo,
  projectDeployedInfo,
  deleteProject,
} from "../../services/projects";
import { deleteSecret, checkSecret } from "../../services/secrets";
import { info } from "../../services/users";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

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
  CID: string;
  UID: number;
  ARCTID: number;
  projectName: string;
  createdDate: string;
  isDeployed: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>(""); // 모달 타입을 구분하는 상태
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSecret, setHasSecret] = useState(false);
  const [filterType, setFilterType] = useState("all"); // 필터링 타입 상태 추가
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태 추가
  const itemsPerPage = 5; // 한 페이지에 보여줄 항목 수
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const result = await checkSecret(token);
          setHasSecret(result);
          // 유저 정보 가져오기
          const userData = await info(token);
          setUserProfile(userData.user);
          // 유저의 프로젝트 리스트 가져오기
          const projectResumeData = await projectResumeInfo(token);
          const projecDeployedtData = await projectDeployedInfo(token);
          const combinedProjects = [
            ...projectResumeData.data,
            ...projecDeployedtData.data,
          ];
          setProjects(combinedProjects); // 응답 데이터에 따라 수정 필요
          console.log(combinedProjects);
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

  // 페이지가 변경될 때 currentPage를 조정하는 useEffect 추가
  useEffect(() => {
    // 현재 페이지가 총 페이지 수보다 클 경우, 총 페이지 수에 맞춰 currentPage 수정
    const totalPages = Math.ceil(filteredProjects().length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [projects, currentPage, itemsPerPage, filterType]);

  // 필터링된 프로젝트 목록 반환
  const filteredProjects = () => {
    if (filterType === "deployed") {
      return projects.filter((project) => project.isDeployed);
    } else if (filterType === "inProgress") {
      return projects.filter((project) => !project.isDeployed);
    } else {
      return projects;
    }
  };
  // 페이지에 맞춰서 보여줄 프로젝트 목록 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const sortedProjects = filteredProjects().sort((a, b) => {
    const dateA = new Date(a.createdDate || 0).getTime(); // createdDate가 없을 경우 1970년 1월 1일로 기본 설정
    const dateB = new Date(b.createdDate || 0).getTime(); // createdDate가 없을 경우 1970년 1월 1일로 기본 설정
    return dateB - dateA; // 최신순 정렬 (타임스탬프 기반 비교)
  });

  const currentProjects = sortedProjects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // 빈 행을 추가해 5개의 행을 유지
  const emptyRows = itemsPerPage - currentProjects.length; // 남은 빈 행의 개수 계산

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredProjects().length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!userProfile) return <div>Loading...</div>;

  const handleProjectClick = (PID: number, isDeployed: boolean) => {
    if (isDeployed) {
      navigate(`/history/${PID}`);
    } else {
      navigate(`/home/${PID}`);
    }
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

  const handleAWSKeySubmitClick = () => {
    navigate("/guide");
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
      alert(response);
      setHasSecret(false);
    }

    setShowDeleteModal(false);
    setProjectToDelete(null); // 초기화
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null); // 모달 닫기
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setIsDropdownOpen(false); // 드롭다운 닫기
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 돌아가기
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <div className="profile-page">
      {/* 상단 프로필 섹션 */}
      <div className="profile-info">
        <div className="profile-left">
          <img
            src="https://www.shareicon.net/data/512x512/2016/08/05/806962_user_512x512.png"
            className="profile-photo"
          />
          <div className="profile-text">
            <h2>{userProfile.username}</h2>
            <p>{userProfile.email}</p>
          </div>
        </div>

        {hasSecret ? (
          <button
            className="AWS-Credential-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              handleAWSKeyDeleteClick();
            }}
          >
            AWS Key 삭제
          </button>
        ) : (
          <button
            className="AWS-Credential-btn create"
            onClick={(e) => {
              handleAWSKeySubmitClick();
            }}
          >
            AWS key 입력
          </button>
        )}
      </div>
      <hr className="userProfile-line-th" />
      {/* 하단 프로젝트 리스트 섹션 */}
      <div className="project-list-container">
        <table className="project-list-table">
          <thead>
            <tr>
              <th className="project-name">Project Name</th>
              <th className="status">&nbsp;&nbsp;Status</th>
              <th className="created-date">Date</th>
              {/* 필터링 드롭다운 버튼 섹션 */}
              <th className="filter-dropdown">
                <button className="dropdown-button" onClick={toggleDropdown}>
                  {filterType === "all"
                    ? "All"
                    : filterType === "deployed"
                    ? "완료"
                    : "진행중"}{" "}
                  &nbsp;
                  <FontAwesomeIcon icon={faChevronDown} />
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-item"
                      onClick={() => handleFilterChange("all")}
                    >
                      모두 보기
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => handleFilterChange("deployed")}
                    >
                      Deploy 완료
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => handleFilterChange("inProgress")}
                    >
                      Deploy 진행중
                    </div>
                  </div>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentProjects.length > 0 ? (
              currentProjects.map((project) => (
                <tr
                  key={project.PID}
                  onClick={() =>
                    handleProjectClick(project.PID, project.isDeployed)
                  }
                >
                  <td>{project.projectName}</td>
                  <td className="status">
                    <div
                      className={`status-common ${
                        project.isDeployed ? "completed" : "in-progress"
                      }`}
                    >
                      {project.isDeployed ? "완료" : "진행중"}
                    </div>
                  </td>
                  <td>{new Date(project.createdDate).toLocaleDateString()}</td>
                  <td className="button-cell">
                    <button
                      className="deleteButton"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(project);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTrashCan}
                        size="xl"
                        className="svg"
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  아직 게시물이 없습니다
                </td>
              </tr>
            )}
            {/* 빈 행을 추가하여 항상 5개의 행이 유지되도록 */}
            {Array.from({ length: emptyRows }, (_, index) => (
              <tr key={`empty-${index}`} className="empty-row">
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            className="prev-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="page-numbers">
            {/* 현재 페이지를 표시 */}
            {Array.from({ length: totalPages }, (_, i) => (
              <span
                key={i + 1}
                className={`page-number ${
                  currentPage === i + 1 ? "active" : ""
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <button
            className="next-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
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
