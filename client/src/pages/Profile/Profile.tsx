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
                    <div 
                        key={project.id} 
                        className="project-item"
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