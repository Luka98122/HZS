import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Terms: React.FC = () => {
    return (
        <div className="App">
            <header className="header">
                <div className="container">
                    <div className="logo">
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                            <span className="logo-icon">💪</span>
                            <h1>FitLife</h1>
                        </Link>
                    </div>
                    <nav className="nav">
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <div className="auth-links">
                                <li><Link to="/login" className="auth-link login-link">Login</Link></li>
                                <li><Link to="/register" className="auth-link register-link">Register</Link></li>
                            </div>
                        </ul>
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <section className="hero" style={{ padding: '3rem 0', minHeight: 'auto' }}>
                    <div className="container" style={{ display: 'block' }}>
                        <h1 className="hero-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Terms and Conditions</h1>
                        <div className="content-block" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', color: 'var(--text-secondary)' }}>
                            <p>Last updated: January 13, 2026</p>

                            <h3>1. Introduction</h3>
                            <p>Welcome to FitLife ("Company", "we", "our", "us"). These Terms and Conditions ("Terms", "Terms and Conditions") govern your use of our website located at react.hoi5.com (the "Service") operated by FitLife.</p>

                            <h3>2. Accounts</h3>
                            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

                            <h3>3. Content</h3>
                            <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>

                            <h3>4. Intellectual Property</h3>
                            <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of FitLife and its licensors. The Service is protected by copyright, trademark, and other laws of both the country and foreign countries.</p>

                            <h3>5. Termination</h3>
                            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>

                            <h3>6. Limitation of Liability</h3>
                            <p>In no event shall FitLife, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>

                            <h3>7. Changes</h3>
                            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

                            <h3>8. Contact Us</h3>
                            <p>If you have any questions about these Terms, please contact us at support@fitlife.com.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="container">
                    <div className="footer-bottom">
                        <p>© 2026 FitLife Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Terms;
