import React, { useEffect, useState } from 'react';
import { checkHealth } from '../api.js';

export default function DatabaseConnection() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    checkHealth().then(() => setStatus('online')).catch(() => setStatus('offline'));
  }, []);

  return (
    <div className={`badge ${status}`} title="API health">
      {status === 'checking' ? 'Checking…' : status === 'online' ? 'API Online' : 'API Offline'}
    </div>
  );
}
