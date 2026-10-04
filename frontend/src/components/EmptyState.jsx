import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = '📋',
  title = 'No records found',
  description = 'There is currently no data to display.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
