import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="white" stroke="#2563EB" strokeWidth="3" />
    <path 
      d="M50 85C20 62 10 45 10 33C10 18 24 12 37 19C43 22 50 30 50 30C50 30 57 22 63 19C76 12 90 18 90 33C90 45 80 62 50 85Z" 
      fill="#34D399" 
    />
    <path 
      d="M50 65V28M35 43L50 28L65 43" 
      stroke="#2563EB" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);