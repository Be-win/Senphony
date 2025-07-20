import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'loading';
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  onClose,
  autoClose = true,
  duration = 4000
}) => {
  useEffect(() => {
    if (autoClose && type !== 'loading') {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [onClose, autoClose, type, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'loading': return '⏳';
      default: return 'ℹ️';
    }
  };

  const getAriaLive = () => {
    switch (type) {
      case 'error': return 'assertive';
      case 'loading': return 'polite';
      default: return 'polite';
    }
  };

  return (
    <div 
      className={`notification show ${type}`}
      role="alert" 
      aria-live={getAriaLive()}
      aria-label={`${type} notification: ${message}`}
    >
      <span className="notification-icon" aria-hidden="true">
        {getIcon()}
      </span>
      <span className="notification-message">{message}</span>
      {type !== 'loading' && (
        <button
          className="notification-close"
          onClick={onClose}
          aria-label="Close notification"
          title="Close notification"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Notification;