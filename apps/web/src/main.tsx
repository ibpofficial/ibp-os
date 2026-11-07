import React from 'react';
import ReactDOM from 'react-dom/client';
import { Desktop } from './components/Desktop/Desktop';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Desktop />
  </React.StrictMode>
);
