import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`notification show ${type}`}
      role="alert" 
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default Notification;