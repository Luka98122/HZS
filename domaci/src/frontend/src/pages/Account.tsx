import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hashPassword } from '../utils/hashPassword';
import './Auth.css'; // Reusing Auth styles for consistency

interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
}

const Account: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch('https://hak.hoi5.com/api/account', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setUsername(data.user.username);
                setEmail(data.user.email);
                setFullName(data.user.full_name);
            } else {
                if (response.status === 401) {
                    navigate('/login');
                } else {
                    setMessage({ type: 'error', text: 'Failed to load account details.' });
                }
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            setMessage({ type: 'error', text: 'An error occurred while loading account details.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setMessage(null);

        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            setUpdating(false);
            return;
        }

        try {
            const payload: any = {
                username,
                email,
                full_name: fullName,
            };

            if (newPassword) {
                payload.password_hash = await hashPassword(newPassword);
            }

            const response = await fetch('https://hak.hoi5.com/api/account', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setMessage({ type: 'success', text: 'Account updated successfully.' });
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Update failed.' });
            }
        } catch (error) {
            console.error('Error updating account:', error);
            setMessage({ type: 'error', text: 'An error occurred while updating account.' });
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('https://hak.hoi5.com/api/account', {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user');
                navigate('/');
                window.location.reload(); 
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Delete failed.' });
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            setMessage({ type: 'error', text: 'An error occurred while deleting account.' });
        }
    };

    if (loading) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                    <p>Loading account details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">
                        <img src="/logo.png" className="logo-icon" alt="Wellness Buddy Logo" />
                        <h1>Wellness Buddy</h1>
                    </Link>
                    <h2>Manage Account</h2>
                    {user && <p style={{ textAlign: 'center', color: '#666' }}>Welcome, {user.username}</p>}
                    <p>Update your personal details below</p>
                </div>

                {message && (
                    <div className={message.type === 'success' ? 'auth-success' : 'auth-error'}>
                        {message.text}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="@username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    <div className="form-divider" style={{ margin: '20px 0', borderTop: '1px solid #eee' }}></div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#333' }}>Change Password (Optional)</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                autoComplete='new-password'
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={updating}
                    >
                        {updating ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <button
                        onClick={handleDelete}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#e74c3c',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            textDecoration: 'underline'
                        }}
                    >
                        Delete my account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Account;
