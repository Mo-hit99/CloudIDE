import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const { login, loading, error: authError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [focusedField, setFocusedField] = useState('');

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear success message when user starts typing
    if (successMessage) setSuccessMessage('');
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    try {
      await login(formData);
      // Navigate to IDE after successful login
      const from = location.state?.from?.pathname || '/ide';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by the AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Background decorations with animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Enhanced Header with animation */}
        <div className="text-center animate-fade-in">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <span className="text-4xl">☁️</span>
          </div>
          <h1 className="mt-6 text-center text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-3 text-center text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Sign in to your Cloud IDE workspace and start coding instantly
          </p>
        </div>

        {/* Enhanced Login Form with better spacing and animations */}
        <form className="mt-8 space-y-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 animate-slide-up" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Enhanced Email/Username Input */}
            <div className="space-y-2">
              <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Email or Username
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === 'identifier' ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    focusedField === 'identifier' 
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  placeholder="Enter your email or username"
                  value={formData.identifier}
                  onChange={handleChange}
                  onFocus={() => handleFocus('identifier')}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Enhanced Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`w-full pl-12 pr-12 py-4 text-base border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    focusedField === 'password' 
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 dark:hover:bg-slate-600 rounded-r-xl transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 text-lg">
                    {showPassword ? '🙈' : '👁️'}
                  </span>
                </button>
              </div>
            </div>

            {/* Enhanced Success Message Display */}
            {successMessage && (
              <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 p-4 animate-fade-in">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Success!
                    </h3>
                    <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                      {successMessage}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Error Display */}
            {authError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 animate-fade-in">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                      Login Error
                    </h3>
                    <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                      {authError}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  Sign in to Cloud IDE
                </span>
              )}
            </button>
          </div>

          {/* Enhanced Sign up link */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200 underline decoration-2 underline-offset-2 hover:decoration-blue-500"
              >
                Create your account
              </Link>
            </p>
          </div>
        </form>

        {/* Enhanced Features Section */}
        <div className="mt-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 py-2 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 text-gray-600 dark:text-gray-400 font-semibold rounded-full border border-gray-200 dark:border-gray-700">
                ✨ Why Choose Cloud IDE?
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group flex items-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-lg">💻</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Personal Workspace</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Isolated development environment</p>
              </div>
            </div>

            <div className="group flex items-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-lg">📁</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Smart Editor</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Syntax highlighting & auto-complete</p>
              </div>
            </div>

            <div className="group flex items-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-lg">🖥️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Integrated Terminal</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Full Linux command access</p>
              </div>
            </div>

            <div className="group flex items-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-lg">🔒</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Secure & Private</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Docker containerized security</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
