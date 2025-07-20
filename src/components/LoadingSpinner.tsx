import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  return (
    <div 
      className={`loading-spinner ${size}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="spinner" aria-hidden="true">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingSpinner; 