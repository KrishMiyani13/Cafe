import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: '30px',
        boxShadow: '0 8px 30px rgba(239, 68, 68, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.85rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div 
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 10px #ffffff',
          animation: 'pulseGlow 1.5s infinite'
        }}
      />
      <WifiOff size={16} />
      <span>Offline Mode Active | Local Cache Enabled</span>
    </div>
  );
};
