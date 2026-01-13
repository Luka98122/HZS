import React, { useEffect, useState } from 'react';
import './Focus.css';

const Focus: React.FC = () => {
    const [message, setMessage] = useState("Breathe In...");

    useEffect(() => {
        const interval = setInterval(() => {
            setMessage(prev => prev === "Breathe In..." ? "Breathe Out..." : "Breathe In...");
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="focus-container">
            <div className="focus-circle">
                <span style={{ fontSize: '3rem' }}>🧘</span>
            </div>
            <div className="focus-message">{message}</div>

            <button className="btn btn-secondary" style={{
                position: 'absolute',
                bottom: '2rem',
                opacity: 0.5
            }} onClick={() => window.location.href = "/home"}>
                Exit Focus Mode
            </button>
        </div>
    );
};

export default Focus;
