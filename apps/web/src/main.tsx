import React from 'react';
import ReactDOM from 'react-dom/client';
import { Desktop } from './components/Desktop/Desktop';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="IBP OS Session Error">
      <Desktop />
    </ErrorBoundary>
  </React.StrictMode>
);
