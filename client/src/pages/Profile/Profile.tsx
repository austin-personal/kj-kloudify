import React from 'react';
import { useNavigate } from 'react-router-dom';

import './Profile.css';

interface Project {
    id: number;
    title: string;
    description: string;
    createdAt: string;
}

interface ProfileProps {
    user: {
        name: string;
        email: string;
        profilePicture: string;
    };
    projects: Project[];
}

const Profile: React.FC<ProfileProps> = ({ user, projects }) => {
    const navigate = useNavigate();

    // 프로젝트 클릭 핸들러
    const handleProjectClick = async (projectId: number) => {
        try {
            // API 호출하여 프로젝트 히스토리 데이터 가져오기
            // 태현 api 주소 확인!!!
            const response = await fetch(`/api/projects/${projectId}/history`);
            if (!response.ok) {
                throw new Error('Failed to fetch project history');
            }
            const projectHistory = await response.json();

            // 가져온 데이터를 History 페이지로 이동하면서 전달
            navigate(`/history/${projectId}`, { state: { project: projectHistory } });
        } catch (error) {
            console.error('Error fetching project history:', error);
        }
    };


    return (
        <div className="profile-page">
            {/* 상단 프로필 섹션 */}
            <div className="profile-info">
                <img src={user.profilePicture} alt={`${user.name}'s profile`} className="profile-picture" />
                <h2>{user.name}</h2>
                <p>{user.email}</p>
            </div>
            
            {/* 하단 프로젝트 리스트 섹션 */}
            <div className="project-list">
                {projects.map((project) => (
<<<<<<< HEAD
                    <div 
                        key={project.id} 
                        className="project-item" 
                        onClick={() => handleProjectClick(project.id)} // 클릭 시 프로젝트 불러오기
                    >
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <small>Created at: {new Date(project.createdAt).toLocaleDateString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;