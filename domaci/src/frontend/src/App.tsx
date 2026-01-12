// App.tsx
import React, { useEffect, useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const HEALTH_URL = 'https://hak.hoi5.com/api/health';
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [apiMessage, setApiMessage] = useState<string>('');

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
            <span className="logo-icon">⚡</span>
            <h1>Nexus</h1>
          </div>
          <nav className="nav">
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#team">Team</a></li>
              <li className="cta-nav"><a href="#demo">View Demo</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h2 className="hero-title">Revolutionizing <span className="highlight">Developer Collaboration</span></h2>
              <p className="hero-subtitle">
                A real-time platform for developers to code, debug, and deploy together - 
                no matter where they are in the world.
              </p>
              <div className="hero-buttons">
                <a href="#demo" className="btn btn-primary">Try Live Demo</a>
                <a href="#github" className="btn btn-secondary">
                  <span className="github-icon">{"</>"}</span>
                  View on GitHub
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">24</span>
                  <span className="stat-label">Hours to Build</span>
                </div>
                <div className="stat">
                  <span className="stat-number">5</span>
                  <span className="stat-label">Team Members</span>
                </div>
                <div className="stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Open Source</span>
                </div>
                <div className="stat">
                <span className="stat-number">
                  {apiStatus === 'checking' && '…'}
                  {apiStatus === 'healthy' && '●'}
                  {apiStatus === 'unhealthy' && '●'}
                </span>
                <span className="stat-label">
                  API Status:{' '}
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
              <div className="code-window">
                <div className="code-header">
                  <div className="window-dots">
                    <div className="dot red"></div>
                    <div className="dot yellow"></div>
                    <div className="dot green"></div>
                  </div>
                  <span className="file-name">collaborate.js</span>
                </div>
                <div className="code-content">
                  <pre>
{`// Real-time collaboration example
const session = new CollaborationSession({
  roomId: 'hackathon-2024',
  language: 'javascript',
  users: ['@alex', '@sam', '@jordan']
});

// Multiple developers can edit simultaneously
session.on('code-change', (change) => {
  broadcastToParticipants(change);
  updateLivePreview();
});

// Integrated debugging for all participants
debugSession.shareBreakpoints();
console.log('Built in 24 hours!');`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="features">
          <div className="container">
            <h2 className="section-title">Why <span className="highlight">Nexus</span> Stands Out</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h3>Real-time Collaboration</h3>
                <p>Code together simultaneously with live cursor tracking, shared terminals, and instant updates.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure by Design</h3>
                <p>End-to-end encryption for all sessions with permission-based access controls.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Lightning Fast</h3>
                <p>Optimized WebSockets ensure minimal latency even with dozens of collaborators.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌐</div>
                <h3>Language Agnostic</h3>
                <p>Supports 50+ programming languages with syntax highlighting and language servers.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works">
          <div className="container">
            <h2 className="section-title">How It <span className="highlight">Works</span></h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Create a Session</h3>
                <p>Start a new collaboration room and invite team members via link or email.</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Code Together</h3>
                <p>Work simultaneously in the same editor with live cursors and shared debugging.</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Deploy Instantly</h3>
                <p>One-click deployment to test environments with integrated CI/CD pipelines.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="team" className="team">
          <div className="container">
            <h2 className="section-title">Our <span className="highlight">Team</span></h2>
            <p className="section-subtitle">Built by passionate developers during a 24-hour hackathon</p>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">AL</div>
                <h3>Alex Morgan</h3>
                <p>Backend Architect</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">SJ</div>
                <h3>Sam Jordan</h3>
                <p>Frontend Lead</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">KR</div>
                <h3>Kai Rivera</h3>
                <p>DevOps Engineer</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">JT</div>
                <h3>Jordan Taylor</h3>
                <p>UX Designer</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">MC</div>
                <h3>Maya Chen</h3>
                <p>Product Manager</p>
              </div>
            </div>
          </div>
        </section>

        <section className="demo-cta" id="demo">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Collaborate Differently?</h2>
              <p className="cta-subtitle">Experience the future of developer collaboration today.</p>
              <a href="#demo" className="btn btn-primary btn-large">Launch Live Demo</a>
              <p className="cta-note">No account required • Free during hackathon</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-icon">⚡</span>
              <h2>Nexus</h2>
              <p className="footer-tagline">Built in 24 hours at Hackathon 2024</p>
            </div>
            <div className="footer-links">
              <div className="link-column">
                <h4>Project</h4>
                <a href="#github">GitHub Repository</a>
                <a href="#docs">Documentation</a>
                <a href="#roadmap">Roadmap</a>
              </div>
              <div className="link-column">
                <h4>Team</h4>
                <a href="#team">Meet the Team</a>
                <a href="#contact">Contact Us</a>
                <a href="#blog">Blog</a>
              </div>
              <div className="link-column">
                <h4>Legal</h4>
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Use</a>
                <a href="#license">MIT License</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Nexus. Built with passion during a hackathon. All code is open source.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;