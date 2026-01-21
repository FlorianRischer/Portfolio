// Author: Florian Rischer
// Login Page - Minimal login/signup dialog for JWT authentication
import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransition } from '../components/PageTransition/TransitionContext';
import './LoginPage.css';

export default function LoginPage() {
  const { navigateWithTransition } = useTransition();
  const { login, signup, isLoading, error, clearError } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    let success: boolean;
    if (isSignup) {
      success = await signup(email, password, name);
    } else {
      success = await login(email, password);
    }
    
    if (success) {
      navigateWithTransition('/home');
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    clearError();
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleBack = () => {
    navigateWithTransition('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">{isSignup ? 'Sign Up' : 'Login'}</h1>
        
        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="login-field">
              <label htmlFor="name" className="login-label">Name</label>
              <input
                type="text"
                id="name"
                className="login-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                disabled={isLoading}
                minLength={2}
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              type="email"
              id="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <input
              type="password"
              id="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              disabled={isLoading}
              minLength={isSignup ? 8 : undefined}
            />
            {isSignup && (
              <span className="login-hint">Minimum 8 characters</span>
            )}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading 
              ? (isSignup ? 'Creating account...' : 'Signing in...') 
              : (isSignup ? 'Create Account' : 'Sign In')
            }
          </button>
        </form>

        <button 
          className="login-toggle-button"
          onClick={toggleMode}
          disabled={isLoading}
          type="button"
        >
          {isSignup 
            ? 'Already have an account? Sign In' 
            : "Don't have an account? Sign Up"
          }
        </button>

        <button 
          className="login-back-button"
          onClick={handleBack}
          disabled={isLoading}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
