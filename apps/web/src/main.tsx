import React from 'react';
import ReactDOM from 'react-dom/client';
import { Desktop } from './components/Desktop/Desktop';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import './index.css';

// Register Service Worker for 100% Offline PWA execution
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="IBP OS Session Error">
      <Desktop />
    </ErrorBoundary>
  </React.StrictMode>
);
