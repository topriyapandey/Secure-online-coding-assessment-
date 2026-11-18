import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const Timer = ({ initialSeconds, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':');

  const isCritical = secondsLeft < 300; // less than 5 minutes

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '6px',
        backgroundColor: isCritical ? '#fef2f2' : '#f8fafc',
        color: isCritical ? '#dc2626' : '#1e293b',
        border: `1px solid ${isCritical ? '#fecaca' : '#cbd5e1'}`,
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9rem'
      }}
    >
      <Clock size={16} color={isCritical ? '#dc2626' : '#64748b'} />
      <span>{formattedTime}</span>
      {isCritical && <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>(Hurry up!)</span>}
    </div>
  );
};
