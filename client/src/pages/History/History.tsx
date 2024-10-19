import React, { useState } from 'react';
import NavBar from '../../components/NavBar/NavBar';
import './History.css';

// 임시 서비스
interface Service {
    id: number;
    name: string;
    status: 'running' | 'stopped';
    price: number;
}

// 임시 프로젝트
interface Project {
    name: string;
    services: Service[];
    previousChats: string[];
}

// HistoryProps 인터페이스
interface HistoryProps {
    project: Project;
}

const History: React.FC<HistoryProps> = ({ project }) => {
    const [showPriceSummary, setShowPriceSummary] = useState(false);
    const [showChatPopup, setShowChatPopup] = useState(false);

    const handleChatButtonClick = () => {
        setShowChatPopup(!showChatPopup);
    };

    return (
        <div className="history-page">
            <div className="project-header">
                <h2>{project.name}</h2>
                <button onClick={() => setShowPriceSummary(!showPriceSummary)} className="price-summary-btn">
                    Price Summary
                </button>
            </div>

            <div className="main-content">
                {/* 이전 채팅 내역 div */}
                <div className={`previous-chats ${showChatPopup ? 'expanded' : ''}`}>
                    <h3>Previous Chats</h3>
                    {project.previousChats.map((chat, index) => (
                        <p key={index}>{chat}</p>
                    ))}
                </div>

                <div className="service-status">
                    <h3>Service Status</h3>
                    {project.services.map((service) => (
                        <div key={service.id} className={`service ${service.status}`}>
                            {service.name}: {service.status}
                        </div>
                    ))}
                </div>

                <div className="architecture-box">
                    <h3>Architecture</h3>
                    <p>Details about the architecture used in this project...</p>
                </div>
            </div>

            {/* Price Summary Div */}
            {showPriceSummary && (
                <div className="price-summary">
                    <h3>Price Summary</h3>
                    {project.services.map((service) => (
                        <div key={service.id}>
                            {service.name}: ${service.price.toFixed(2)}
                        </div>
                    ))}
                </div>
            )}
            
            {/* 채팅 버튼 */}
            <button onClick={handleChatButtonClick} className="chat-button">
                Previous Chats
            </button>
        </div>
    );
};

export default History;