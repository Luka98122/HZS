import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

interface User {
    full_name: string;
    email: string;
    username: string;
}

const Home: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse user data", error);
            }
        }
    }, [navigate]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="home-container">
            <h1 className="home-greeting">
                {user ? `${getGreeting()}, ${user.full_name}` : 'Hello there!'}
            </h1>

            <p className="home-question">What should we work on today?</p>

            <div className="home-actions">
                <Link to="/workout" className="action-card">
                    <span className="action-icon">💪</span>
                    <span className="action-title">Workout</span>
                </Link>

                <Link to="/study" className="action-card">
                    <span className="action-icon">📚</span>
                    <span className="action-title">Study</span>
                </Link>

                <Link to="/focus" className="action-card">
                    <span className="action-icon">🧘</span>
                    <span className="action-title">Focus</span>
                </Link>

                <Link to="/stress" className="action-card">
                    <span className="action-icon">🌬️</span>
                    <span className="action-title">De-Stress</span>
                </Link>
            </div>

            <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: '3rem' }}>
                Go to Dashboard
            </Link>
        </div>
    );
};

export default Home;
