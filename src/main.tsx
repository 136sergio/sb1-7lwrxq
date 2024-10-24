import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

// Force clear cache on load
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}

// Clear localStorage except for auth data
const authData = localStorage.getItem('sb-oonkehbpnuxjonljzdmw-auth-token');
localStorage.clear();
if (authData) {
  localStorage.setItem('sb-oonkehbpnuxjonljzdmw-auth-token', authData);
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);