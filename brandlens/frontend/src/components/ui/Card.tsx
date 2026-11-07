import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white/90 rounded-2xl border border-border/80 shadow-subtle p-5 backdrop-blur-xs transition-all duration-200 relative overflow-hidden ${
        hoverable || onClick
          ? 'hover:shadow-card-hover hover:border-brand-200 cursor-pointer gradient-card-border'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
