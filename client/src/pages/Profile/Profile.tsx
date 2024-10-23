import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { projectAllInfo } from '../../services/projects';
import { info } from '../../services/users';

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
    const token = localStorage.getItem('token');

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
                    navigate('/');
                }
            } catch (error) {
                console.error('데이터 로딩 중 오류 발생:', error);
            }
        };

        fetchData();
    }, [token, navigate]);

    if (!userProfile) return <div>Loading...</div>;

    const handleProjectClick = (PID: number) => {
        navigate(`/history/${PID}`);
    };

    return (
        <div className="profile-page">
            {/* 상단 프로필 섹션 */}
            <div className="profile-info">
                <h2>{userProfile.username}</h2>
                <p>{userProfile.email}</p>
            </div>
            <hr className='userProfile-line-th' />
            {/* 하단 프로젝트 리스트 섹션 */}
            <div className="project-list">
                {projects.map((project) => (
                    <div
                        key={project.PID}
                        className="project-item"
                        onClick={() => handleProjectClick(project.PID)} // 클릭 이벤트 핸들러 추가
                    >
                        <h3>{project.projectName}</h3>
                        <p>{project.PID}</p>
                        <small>{new Date(project.createdDate).toLocaleDateString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
