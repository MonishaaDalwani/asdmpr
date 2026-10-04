import React from 'react';

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const typeStyles = {
    info: 'alert-info',
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '⚠️',
    warning: '🔔',
  };

  return (
    <div className={`alert ${typeStyles[type] || 'alert-info'}`}>
      <span className="alert-icon">{icons[type]}</span>
      <div className="alert-content">{message}</div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close alert">
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
