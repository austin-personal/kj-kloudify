import React, { useState } from 'react';
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

    const [isChatting, setIsChatting] = useState(false);
    const [isPriceSummary, setIsPriceSummary] = useState(false);

    return (
        <div className="history-page">

            <div className="project-header">
                <p className='project-name-title-th'>Project Name : <span className='project-name-th'>{tempProject.name}</span></p>
                <div className='price-summary-frame'>
                        <div className={`price-summary-box ${isPriceSummary ? 'open' : 'close'}`}>
                            {tempProject.services.map((service) => (
                                <div>
                                    {service.name} : {service.price}
                                </div>
                            ))}
                        </div>
                    <button className="price-summary-btn-th"
                        onClick={(e) => setIsPriceSummary(!isPriceSummary)}>
                        Price Summary
                    </button>
                </div>
            </div>

            <div className="main-content">
                <div className="previous-chat">
                    <button className='chat-button'
                        onClick={(e) => setIsChatting(!isChatting)}>previous chat</button>
                    <div className="previous-chat-explanation-th">
                        Previous chat
                    </div>
                </div>
                <div className="left-content">
                    <div className={`previous-chatting-th ${isChatting ? 'open' : 'close'}`}>
                        <h3>Previous Chat</h3>
                        {tempProject.previousChats.map((chat) => (
                            <div>
                                {chat}
                            </div>
                        ))}
                    </div>
                    <div className="service-status-th">
                        <h3>Service Status</h3>
                        {tempProject.services.map((service) => (
                            <div key={service.id} className={`service ${service.status}`}>
                                {service.name}: {service.status}
                            </div>
                        ))}
                    </div>
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
