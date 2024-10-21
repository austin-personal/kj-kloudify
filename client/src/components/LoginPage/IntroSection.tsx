import React, { useState } from 'react';
import './IntroSection.css';

const introData = [
    { id: 1, content: "Welcome to our platform! Discover amazing features." },
    { id: 2, content: "Join us today and start your journey!" },
    { id: 3, content: "Experience seamless integration and powerful tools." },
];

const IntroSection: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState('');

    const handleDotClick = (index: number) => {
        if (index < currentIndex) {
            setDirection('right');
        } else {
            setDirection('left');
        }
        setCurrentIndex(index);
    };

    return (
        <div className="intro-section">
            <div className={`intro-content ${direction}`}>
                {introData[currentIndex].content}
            </div>
            <div className="intro-dots">
                {introData.map((_, index) => (
                    <span 
                        key={index} 
                        className={`dot ${currentIndex === index ? 'active' : ''}`}
                        onClick={() => handleDotClick(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default IntroSection;