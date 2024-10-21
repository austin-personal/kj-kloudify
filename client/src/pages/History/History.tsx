import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './History.css';

// 이렇게 올 예정
// navigate(`/history/${projectId}`, { state: { project: projectHistory } });

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

// 임시 데이터
const tempProject: Project = {
    id: 1,
    name: 'Project Alpha',
    services: [
        {
            id: 1,
            name: 'EC2 Instance',
            status: 'running',
            price: 20.5
        },
        {
            id: 2,
            name: 'S3 Bucket',
            status: 'stopped',
            price: 5.0
        },
        {
            id: 3,
            name: 'RDS Database',
            status: 'running',
            price: 30.0
        }
    ],
    previousChats: [
        'How do I start an EC2 instance?',
        'What is the cost of running an S3 bucket?',
        'How to set up a new database in RDS?'
    ]
}

const History: React.FC = () => {
    return (
        <div className="history-page">
            <div className="project-header">
                <h2>{tempProject.name}</h2>
                <button className="price-summary-btn">
                    Price Summary
                </button>
            </div>

            <div className="main-content">
                <div className="previous-chats">
                    <h3>Previous Chats</h3>
                    {tempProject.previousChats.map((chat, index) => (
                        <p key={index}>{chat}</p>
                    ))}
                </div>

                <div className="service-status">
                    <h3>Service Status</h3>
                    {tempProject.services.map((service) => (
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
        </div>
    );
};

export default History;
