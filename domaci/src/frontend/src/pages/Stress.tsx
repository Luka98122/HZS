import React from 'react';
import './Stress.css';

const Stress: React.FC = () => {
    return (
        <div className="stress-container">
            <div className="container">
                <div className="stress-header">
                    <h1>Stress Management</h1>
                    <p style={{ fontSize: '1.2rem' }}>Take a moment to center yourself and decompress.</p>
                </div>

                <div className="stress-tools">
                    <div className="tool-card">
                        <div className="tool-icon">🌬️</div>
                        <h3>Breathing</h3>
                        <p>Guided 4-7-8 breathing technique to reduce anxiety instantly.</p>
                    </div>
                    <div className="tool-card">
                        <div className="tool-icon">📝</div>
                        <h3>Journaling</h3>
                        <p>Write down your thoughts to clear your mind and gain perspective.</p>
                    </div>
                    <div className="tool-card">
                        <div className="tool-icon">🎧</div>
                        <h3>Soundscapes</h3>
                        <p>Listen to calming rain, forest sounds, or white noise.</p>
                    </div>
                </div>

                <div className="mood-tracker">
                    <h3>How are you feeling right now?</h3>
                    <div className="mood-options">
                        <button className="mood-btn">😫</button>
                        <button className="mood-btn">😕</button>
                        <button className="mood-btn">😐</button>
                        <button className="mood-btn">🙂</button>
                        <button className="mood-btn">🤩</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stress;
