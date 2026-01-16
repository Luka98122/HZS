// App.tsx
import React, { useEffect, useState } from 'react';
import './App.css';
import { Link } from 'react-router-dom';

const App: React.FC = () => {
  const HEALTH_URL = 'https://hak.hoi5.com/api/health';
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [apiMessage, setApiMessage] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(isAuth);
    };

    checkAuth();
    // Listen for storage events to update state if login happens in another tab/window
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('https://hak.hoi5.com/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      setIsAuthenticated(false);
      window.location.reload();
    }
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(HEALTH_URL);
        const data = await response.json();

        if (response.ok && data.status === 'ok') {
          setApiStatus('healthy');
          setApiMessage(data.message);
        } else {
          setApiStatus('unhealthy');
        }
      } catch {
        setApiStatus('unhealthy');
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="logo">
            <img src="/logo.png" className="logo-icon" alt="Wellness Buddy Logo" />
            <h1>Wellness Buddy</h1>
          </div>
          <nav className="nav">
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#workouts">Workouts</a></li>
              <li><a href="#trainers">Trainers</a></li>
              <li className="auth-links">
                {isAuthenticated ? (
                  <>
                    <Link to="/account" className="auth-link login-link">Account</Link>
                    <button
                      onClick={handleLogout}
                      className="auth-link login-link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="auth-link login-link">Login</Link>
                    <Link to="/register" className="auth-link register-link">Register</Link>
                  </>
                )}
              </li>
              <li className="cta-nav"><a href="/register">Get Started</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h2 className="hero-title">Your Partner in <span className="highlight">Wellbeing</span></h2>
              <p className="hero-subtitle">
                Your all-in-one buddy for mental and physical health, and work-life balance.
                Track your progress, find your center, and reach your goals.
              </p>
              <div className="hero-buttons">
                <a href="/register" className="btn btn-primary">Start Your Journey</a>
                <a href="#features" className="btn btn-secondary">
                  <span>Explore Features</span>
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">10k+</span>
                  <span className="stat-label">Active Users</span>
                </div>
                <div className="stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Workout Guides</span>
                </div>
                <div className="stat">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">Goal Success</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="workout-card">
                <div className="workout-header">
                  <div>
                    <span className="card-title">Daily Activity</span>
                    <div className="card-subtitle">January 13, 2026</div>
                  </div>
                  <div className="activity-icon">🏃‍♂️</div>
                </div>
                <div className="workout-stats-grid">
                  <div className="w-stat">
                    <span className="w-label">Steps</span>
                    <span className="w-value">8,432</span>
                  </div>
                  <div className="w-stat">
                    <span className="w-label">Calories</span>
                    <span className="w-value">420</span>
                  </div>
                  <div className="w-stat">
                    <span className="w-label">Heart Rate</span>
                    <span className="w-value">112 <small>bpm</small></span>
                  </div>
                </div>
                <div className="workout-progress">
                  <div className="progress-label">
                    <span>Daily Goal</span>
                    <span>84%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REWRITTEN: FEATURES (based on backend endpoints) */}
        <section id="features" className="features">
          <div className="container">
            <h2 className="section-title">What You Can Do with <span className="highlight">Wellness Buddy</span></h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3>Your Weekly Dashboard</h3>
                <p>
                  Get a weekly overview of your progress—workouts, study hours, streaks, mood average,
                  water intake, focus sessions, and calories—all in one place.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🧘</div>
                <h3>Focus & Calm Sessions</h3>
                <p>
                  Start guided focus sessions with a chosen session type and duration, optionally add breathing
                  patterns and ambient sound, then review your recent session history anytime.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>Mood, Journal & Gratitude</h3>
                <p>
                  Check in with a mood score (and notes), write stress journal entries, and build a gratitude habit
                  with daily entries—then see your recent history and weekly mood average.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏋️</div>
                <h3>Study + Fitness Tracking</h3>
                <p>
                  Track study sessions with distractions and pomodoros, manage tasks and streaks, and log workouts
                  exercise-by-exercise. Plus, record water intake and use stretch reminders to stay consistent.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="workouts" className="how-it-works">
          <div className="container">
            <h2 className="section-title">How It <span className="highlight">Works</span></h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Create Your Account</h3>
                <p>
                  Register and log in to start a secure session. Update your profile anytime—or delete your account
                  whenever you want.
                </p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Onboard & Get Recommendations</h3>
                <p>
                  Complete a quick onboarding quiz (physical, study, focus, and stress goals) and get personalized
                  recommendations generated for you.
                </p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Track Daily Habits, See Weekly Progress</h3>
                <p>
                  Log workouts, water, study sessions, focus sessions, mood, journal, and gratitude. Then review your
                  weekly dashboard to spot patterns and build better routines.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="trainers" className="team">
          <div className="container">
            <h2 className="section-title">Meet the <span className="highlight">Developers</span></h2>
            <p className="section-subtitle">Expert team dedicated to your success</p>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">AV</div>
                <h3>Aleksandar Vasilić</h3>
                <p>Backend dev</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">PT</div>
                <h3>Petar Tolimir</h3>
                <p>Backend dev</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">LM</div>
                <h3>Luka Marković</h3>
                <p>Fullstack dev</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">MM</div>
                <h3>Marko Mitić</h3>
                <p>Frontend dev</p>
              </div>
            </div>
          </div>
        </section>

        <section className="demo-cta" id="start">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Transform Your Life?</h2>
              <p className="cta-subtitle">Join thousands of others on their journey to better health.</p>
              <a href="register" className="btn btn-primary btn-large">JOIN NOW</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <img src="/logo.png" className="logo-icon" alt="Wellness Buddy Logo" />
              <h2>Wellness Buddy</h2>
              <p className="footer-tagline">Your partner for mental and physical wellbeing.</p>
            </div>
            <div className="footer-links">
              <div className="link-column">
                <h4>Platform</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#workouts">Workouts</a>
              </div>
              <div className="link-column">
                <h4>Company</h4>
                <a href="#about">About Us</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="link-column">
                <h4>Legal</h4>
                <Link to="/privacy">Privacy</Link>
                <Link to="/terms">Terms</Link>
                <a href="#cookies">Cookies</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Wellness Buddy Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
