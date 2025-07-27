import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  color = 'blue',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          animate-spin 
          rounded-full 
          border-2 
          border-t-transparent
        `}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      
      {message && (
        <p className={`
          ${textSizeClasses[size]} 
          text-gray-600 
          dark:text-gray-400 
          font-medium
          animate-pulse
        `}>
          {message}
        </p>
      )}
    </div>
  );
};

// Inline loading spinner for buttons
export const InlineSpinner = ({ size = 'small', color = 'white' }) => {
  const sizeClasses = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]}
        animate-spin 
        rounded-full 
        border-2 
        border-t-transparent
        inline-block
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Full page loading overlay
export const LoadingOverlay = ({ 
  message = 'Loading...', 
  transparent = false 
}) => {
  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      ${transparent 
        ? 'bg-black bg-opacity-25' 
        : 'bg-white dark:bg-gray-900'
      }
    `}>
      <LoadingSpinner 
        size="large" 
        message={message}
        color={transparent ? 'white' : 'blue'}
      />
    </div>
  );
};

// Loading skeleton for content
export const LoadingSkeleton = ({ 
  lines = 3, 
  className = '',
  animated = true 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            h-4 
            bg-gray-200 
            dark:bg-gray-700 
            rounded
            ${animated ? 'animate-pulse' : ''}
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
          `}
        />
      ))}
    </div>
  );
};

// Loading dots animation
export const LoadingDots = ({ 
  color = 'gray',
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'h-1 w-1',
    medium: 'h-2 w-2',
    large: 'h-3 w-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600'
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`
            ${sizeClasses[size]}
            ${colorClasses[color]}
            rounded-full
            animate-bounce
          `}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
