import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './History.css';

interface Service {
    id: number;
    name: string;
    status: 'running' | 'stopped';
    price: number;
}

interface Project {
    id: number;
    name: string;
    services: Service[];
    previousChats: string[];
}

const History: React.FC = () => {
    const location = useLocation();
    const project = location.state?.project as Project;

    const [showPriceSummary, setShowPriceSummary] = useState(false);
    const [showChatPopup, setShowChatPopup] = useState(false);

    const handleChatButtonClick = () => {
        setShowChatPopup(!showChatPopup);
    };

    if (!project) {
        return <p>No project data available.</p>;
    }

    return (
        <div className="history-page">
            <div className="project-header">
                <h2>{project.name}</h2>
                <button onClick={() => setShowPriceSummary(!showPriceSummary)} className="price-summary-btn">
                    Price Summary
                </button>
            </div>

            <div className="main-content">
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

            <button onClick={handleChatButtonClick} className="chat-button">
                Previous Chats
            </button>
        </div>
    );
};

export default History;
