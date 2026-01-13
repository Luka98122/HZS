import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Privacy: React.FC = () => {
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
                        <h1 className="hero-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Privacy Policy</h1>
                        <div className="content-block" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', color: 'var(--text-secondary)' }}>
                            <p>Last updated: January 13, 2026</p>

                            <h3>1. Information We Collect</h3>
                            <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
                            <ul>
                                <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Email address, First name and last name, Cookies and Usage Data.</li>
                                <li><strong>Usage Data:</strong> We may also collect information how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
                            </ul>
                            <br />

                            <h3>2. Use of Data</h3>
                            <p>FitLife uses the collected data for various purposes:</p>
                            <ul>
                                <li>To provide and maintain the Service</li>
                                <li>To notify you about changes to our Service</li>
                                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                                <li>To provide customer care and support</li>
                                <li>To provide analysis or valuable information so that we can improve the Service</li>
                                <li>To monitor the usage of the Service</li>
                                <li>To detect, prevent and address technical issues</li>
                            </ul>
                            <br />

                            <h3>3. Transfer Of Data</h3>
                            <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>

                            <h3>4. Security Of Data</h3>
                            <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

                            <h3>5. Service Providers</h3>
                            <p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>

                            <h3>6. Changes To This Privacy Policy</h3>
                            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.</p>

                            <h3>7. Contact Us</h3>
                            <p>If you have any questions about this Privacy Policy, please contact us at support@fitlife.com.</p>
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

export default Privacy;
