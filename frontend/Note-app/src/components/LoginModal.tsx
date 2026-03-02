import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import "./LoginModal.css";

interface LoginModalProps {
    onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'An error occurred');
            }

            if (isLogin) {
                // If login works, we hit /auth/me to get the user object and save in context
                const meRes = await fetch('/api/auth/me');
                if (meRes.ok) {
                    const userData = await meRes.json();
                    login(userData);
                    onClose();
                } else {
                    throw new Error("Failed to fetch user profile");
                }
            } else {
                // Registration successful, log them in automatically
                await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const meRes = await fetch('/api/auth/me');
                if (meRes.ok) {
                    const userData = await meRes.json();
                    login(userData);
                    onClose();
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-modal-overlay">
            <div className="login-modal">
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isLogin ? "Your password" : "At least 8 chars, 1 uppercase, 1 number"}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Register')}
                    </button>
                </form>

                <p className="toggle-mode">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Register here" : "Sign in here"}
                    </span>
                </p>
            </div>
        </div>
    );
}
