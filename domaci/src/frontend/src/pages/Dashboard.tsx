import React from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-container container">
            <header className="dashboard-header">
                <h1>Hello, Alex! 👋</h1>
                <p>Here's your daily overview.</p>
            </header>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Fitness</h3>
                        <span className="card-icon">🔥</span>
                    </div>
                    <p>Calories Burned</p>
                    <div className="stat-value">420 <small style={{ fontSize: '1rem', color: '#94a3b8' }}>kcal</small></div>
                    <div style={{ marginTop: '1rem', height: '6px', background: '#334155', borderRadius: '4px' }}>
                        <div style={{ width: '65%', height: '100%', background: '#6366f1', borderRadius: '4px' }}></div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Study</h3>
                        <span className="card-icon">📚</span>
                    </div>
                    <p>Hours Focused</p>
                    <div className="stat-value">3.5 <small style={{ fontSize: '1rem', color: '#94a3b8' }}>hrs</small></div>
                    <div style={{ marginTop: '1rem', height: '6px', background: '#334155', borderRadius: '4px' }}>
                        <div style={{ width: '40%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Wellness</h3>
                        <span className="card-icon">🧘</span>
                    </div>
                    <p>Stress Level</p>
                    <div className="stat-value">Low <small style={{ fontSize: '1rem', color: '#94a3b8' }}>GOOD</small></div>
                </div>

                <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header">
                        <h3>Upcoming Tasks</h3>
                    </div>
                    <ul style={{ listStyle: 'none' }}>
                        <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Math Assignment</span>
                            <span style={{ color: '#f87171' }}>Due Tomorrow</span>
                        </li>
                        <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Morning Run</span>
                            <span style={{ color: '#fbbf24' }}>7:00 AM</span>
                        </li>
                        <li style={{ padding: '0.8rem 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Meditation</span>
                            <span style={{ color: '#34d399' }}>8:00 PM</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
