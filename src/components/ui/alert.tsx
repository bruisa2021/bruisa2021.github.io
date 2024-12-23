import React from 'react';

interface AlertProps {
  className?: string;
  children?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ className = '', children }) => (
  <div className={`p-4 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

export const AlertDescription: React.FC<AlertProps> = ({ className = '', children }) => (
  <p className={`text-sm ${className}`}>
    {children}
  </p>
);