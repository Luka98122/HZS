import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Focus.css';

const Focus: React.FC = () => {
    const [message, setMessage] = useState("Breathe In...");
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [showCheckin, setShowCheckin] = useState(false);
    const navigate = useNavigate();

    // Breathing animation timer
    useEffect(() => {
        if (showCheckin) return;

        const interval = setInterval(() => {
            setMessage(prev => prev === "Breathe In..." ? "Breathe Out..." : "Breathe In...");
        }, 4000);
        return () => clearInterval(interval);
    }, [showCheckin]);

    // Session countdown timer
    useEffect(() => {
        if (showCheckin) return;

        if (timeLeft <= 0) {
            setShowCheckin(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, showCheckin]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleYes = () => {
        navigate('/home');
    };

    const handleMoreTime = () => {
        setTimeLeft(300);
        setShowCheckin(false);
    };

    return (
        <div className="focus-container">
            <div className="focus-timer" style={{
                position: 'absolute',
                top: '2rem',
                fontSize: '1.5rem',
                opacity: 0.8,
                fontFamily: 'monospace'
            }}>
                {formatTime(timeLeft)}
            </div>

            <div className={`focus-content ${showCheckin ? 'blurred' : ''}`}>
                <div className="focus-circle">
                    <span style={{ fontSize: '3rem' }}>🧘</span>
                </div>
                <div className="focus-message">{message}</div>
            </div>

            {showCheckin && (
                <div className="checkin-modal" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(30, 30, 30, 0.95)',
                    padding: '2rem',
                    borderRadius: '1rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    zIndex: 10,
                    minWidth: '300px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Do you feel better?</h2>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={handleYes}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: '#4CAF50',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Yes
                        </button>
                        <button
                            onClick={handleMoreTime}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            No, I need more time
                        </button>
                    </div>
                </div>
            )}

            {!showCheckin && (
                <button className="btn btn-secondary" style={{
                    position: 'absolute',
                    bottom: '2rem',
                    opacity: 0.5
                }} onClick={() => navigate('/home')}>
                    Exit Focus Mode
                </button>
            )}
        </div>
    );
};

export default Focus;
