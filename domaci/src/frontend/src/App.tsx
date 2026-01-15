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
                    <button onClick={handleLogout} className="auth-link login-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
              <li className="cta-nav"><a href="#start">Get Started</a></li>
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
                <a href="#start" className="btn btn-primary">Start Your Journey</a>
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
                <div className="stat">
                  <span className="stat-number">
                    {apiStatus === 'checking' && '…'}
                    {apiStatus === 'healthy' && '●'}
                    {apiStatus === 'unhealthy' && '●'}
                  </span>
                  <span className="stat-label">
                    System Status:{' '}
                    <strong
                      style={{
                        color:
                          apiStatus === 'healthy'
                            ? '#2ecc71'
                            : apiStatus === 'unhealthy'
                              ? '#e74c3c'
                              : '#f1c40f',
                      }}
                    >
                      {apiStatus}
                    </strong>
                    <br />
                    {apiMessage && (
                      <>
                        <br />
                        <small>{apiMessage}</small>
                      </>
                    )}
                  </span>
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

        <section id="features" className="features">
          <div className="container">
            <h2 className="section-title">Why <span className="highlight">Wellness Buddy</span>?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Holistic Tracking</h3>
                <p>Track your movement, nutrition, and mental clarity with our intuitive system.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3>Personalized Balance</h3>
                <p>Plans for fitness, mindfulness, and work-life harmony tailored for you.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>Community Challenges</h3>
                <p>Compete with friends, join global leaderboards, and stay motivated together.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🥗</div>
                <h3>Expert Guidance</h3>
                <p>Access tips, recipes, and video guides from certified coaches and nutritionists.</p>
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
                <h3>Set Your Goals</h3>
                <p>Tell us what you want to achieve—weight loss, muscle gain, or better endurance.</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Follow the Plan</h3>
                <p>Receive your daily workout and meal plan, customized just for you.</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>See Results</h3>
                <p>Track your improvements over time and celebrate your milestones.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="trainers" className="team">
          <div className="container">
            <h2 className="section-title">Meet Your <span className="highlight">Coaches</span></h2>
            <p className="section-subtitle">Expert trainers dedicated to your success</p>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">AM</div>
                <h3>Luka Markovic</h3>
                <p>HIIT Specialist</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">SJ</div>
                <h3>Petar Tolimir</h3>
                <p>Yoga & Mindfulness</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">KR</div>
                <h3>Aleksandar Vasilic</h3>
                <p>Strength Coach</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">JT</div>
                <h3>Marko Mitic</h3>
                <p>Nutritionist</p>
              </div>
            </div>
          </div>
        </section>

        <section className="demo-cta" id="start">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Transform Your Life?</h2>
              <p className="cta-subtitle">Join thousands of others on their journey to better health.</p>
              <a href="#register" className="btn btn-primary btn-large">Start Free Trial</a>
              <p className="cta-note">No credit card required for 7 days • Cancel anytime</p>
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