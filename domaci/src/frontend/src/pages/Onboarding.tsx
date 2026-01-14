import React, { useState } from 'react';
import './Onboarding.css';
import { Link } from 'react-router-dom';

const Onboarding: React.FC = () => {
    const [step, setStep] = useState(1);

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <div className="onboarding-steps">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`step-dot ${step === s ? 'active' : ''}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="step-content">
                        <span className="welcome-icon">👋</span>
                        <h2>Welcome to Wellness Buddy</h2>
                        <p>Let's personalize your experience. What is your primary goal?</p>
                        <button className="btn btn-primary" onClick={() => setStep(2)}>Get Started</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-content">
                        <span className="welcome-icon">🎯</span>
                        <h2>Set Your Goals</h2>
                        <p>Choose what matters most to you right now.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '2rem 0' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(3)}>Fitness</button>
                            <button className="btn btn-secondary" onClick={() => setStep(3)}>Focus</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-content">
                        <span className="welcome-icon">🚀</span>
                        <h2>You're All Set!</h2>
                        <p>Your dashboard is ready. Let's dive in.</p>
                        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
