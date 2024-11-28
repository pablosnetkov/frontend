'use client';

import { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onComplete: () => void;
}

export default function Notification({ message, type, onComplete }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const duration = 2000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Время для анимации исчезновения
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  return (
    <div
      className={`
        fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg 
        transform transition-all duration-300
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
    >
      <div className="p-4">
        <div className="flex items-center">
          <div className={`flex-shrink-0 w-6 h-6 ${
            type === 'success' ? 'text-green-500' : 'text-red-500'
          }`}>
            {type === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${
              type === 'success' ? 'text-green-900' : 'text-red-900'
            }`}>
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full overflow-hidden">
        <div 
          className="h-full bg-gray-900"
          style={{ 
            width: '100%',
            animation: `shrinkWidth ${duration}ms linear forwards`
          }}
        />
      </div>
      <style jsx>{`
        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
} 