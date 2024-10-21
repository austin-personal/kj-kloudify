import React, { useState } from 'react';
import './History.css';
import ServiceStatus from '../../components/HistoryPage/ServiceStatus';
import PreviousChat from '../../components/HistoryPage/PreviousChat';

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
                <h2>{tempProject.name}</h2>
                <div className='price-summary-frame'>
                    {isPriceSummary ?
                        <div className='price-summary-box'>
                            {tempProject.services.map((service) => (
                                <div>
                                    {service.name} : {service.price}
                                </div>
                            ))}
                        </div>
                        : ''}
                    <button className="price-summary-btn"
                        onClick={(e) => setIsPriceSummary(!isPriceSummary)}>
                        Price Summary
                    </button>
                </div>
            </div>

            <div className="main-content">
                <div className="previous-chat">
                    <button className='chat-button'
                        onClick={(e) => setIsChatting(!isChatting)}>previous chat</button>
                </div>
                <div className="left-content">
                    {isChatting ? (
                        <ServiceStatus projectServices={tempProject.services} />
                    ) : (
                        <PreviousChat previousChats={tempProject.previousChats} />
                    )}
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
