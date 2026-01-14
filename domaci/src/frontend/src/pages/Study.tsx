import React from 'react';
import './Study.css';

const Study: React.FC = () => {
    return (
        <div className="study-container container">
            <h1 className="section-title">Deep Work Session</h1>

            <div className="study-timer-section">
                <p style={{ letterSpacing: '0.2rem', textTransform: 'uppercase', color: '#007B5F' }}>Focus Timer</p>
                <div className="timer">25:00</div>
                <div className="study-controls">
                    <button className="btn btn-primary btn-large">Start Focus</button>
                    <button className="btn btn-secondary btn-large">Short Break</button>
                </div>
            </div>

            <div className="task-board">
                <div className="task-column">
                    <h3 style={{ marginBottom: '1rem', color: '#94a3b8' }}>To Do</h3>
                    <div className="task-card">Read Chapter 4</div>
                    <div className="task-card">Math Practice Set</div>
                    <div className="task-card">History Essay Outline</div>
                </div>
                <div className="task-column">
                    <h3 style={{ marginBottom: '1rem', color: '#fcd34d' }}>In Progress</h3>
                    <div className="task-card" style={{ borderLeft: '4px solid #fcd34d' }}>Physics Lab Report</div>
                </div>
                <div className="task-column">
                    <h3 style={{ marginBottom: '1rem', color: '#34d399' }}>Done</h3>
                    <div className="task-card" style={{ opacity: 0.6, textDecoration: 'line-through' }}>Chemistry Quiz</div>
                </div>
            </div>
        </div>
    );
};

export default Study;
