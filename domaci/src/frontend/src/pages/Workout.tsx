import React from 'react';
import './Workout.css';

const Workout: React.FC = () => {
    return (
        <div className="workout-container container">
            <header className="workout-hero">
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Upper Body Power</h1>
                <p style={{ fontSize: '1.2rem', color: '#e2e8f0' }}>45 Min • Intermediate • Strength</p>
                <div className="workout-stats">
                    <div>
                        <strong>Sets</strong>
                        <div style={{ fontSize: '1.5rem' }}>12</div>
                    </div>
                    <div>
                        <strong>Kcal</strong>
                        <div style={{ fontSize: '1.5rem' }}>320</div>
                    </div>
                </div>
                <button className="btn btn-primary btn-large" style={{ marginTop: '2rem' }}>Start Workout</button>
            </header>

            <h2 style={{ marginBottom: '1.5rem' }}>Exercises</h2>
            <div className="exercise-list">
                <div className="exercise-item">
                    <div style={{ fontSize: '2rem', width: '3rem', textAlign: 'center' }}>1</div>
                    <div className="exercise-info">
                        <h3>Bench Press</h3>
                        <div className="exercise-meta">3 Sets x 8-10 Reps</div>
                    </div>
                    <span style={{ padding: '0.5rem', background: '#334155', borderRadius: '4px' }}>Compound</span>
                </div>

                <div className="exercise-item">
                    <div style={{ fontSize: '2rem', width: '3rem', textAlign: 'center' }}>2</div>
                    <div className="exercise-info">
                        <h3>Overhead Press</h3>
                        <div className="exercise-meta">3 Sets x 10 Reps</div>
                    </div>
                    <span style={{ padding: '0.5rem', background: '#334155', borderRadius: '4px' }}>Shoulders</span>
                </div>

                <div className="exercise-item">
                    <div style={{ fontSize: '2rem', width: '3rem', textAlign: 'center' }}>3</div>
                    <div className="exercise-info">
                        <h3>Pull Ups</h3>
                        <div className="exercise-meta">3 Sets x AMRAP</div>
                    </div>
                    <span style={{ padding: '0.5rem', background: '#334155', borderRadius: '4px' }}>Back</span>
                </div>
            </div>
        </div>
    );
};

export default Workout;
