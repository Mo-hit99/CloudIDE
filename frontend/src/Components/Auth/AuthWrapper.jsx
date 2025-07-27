import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import LoadingSpinner from '../LoadingSpinner';

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" message="Loading Cloud IDE..." />
      </div>
    );
  }

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    const handleLogin = (user, token) => {
      console.log('User logged in:', user);
      // Auth context will handle the state update
    };

    const handleSignup = (user, token) => {
      console.log('User signed up:', user);
      // Auth context will handle the state update
    };

    const switchToSignup = () => setAuthMode('signup');
    const switchToLogin = () => setAuthMode('login');

    if (authMode === 'signup') {
      return (
        <SignupPage
          onSignup={handleSignup}
          onSwitchToLogin={switchToLogin}
        />
      );
    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={switchToSignup}
      />
    );
  }

  // Show main app if authenticated
  return children;
};

export default AuthWrapper;
