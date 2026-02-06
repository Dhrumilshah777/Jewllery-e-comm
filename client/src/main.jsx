import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';

import axios from 'axios';

import ErrorBoundary from './components/ErrorBoundary';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Data is always stale, fetch immediately
      cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: true, // Refetch when window gains focus
    },
  },
});

// Set base URL for axios based on environment
if (Capacitor.isNativePlatform()) {
  // Use the live server URL for the Android app
  axios.defaults.baseURL = 'https://jewllery-e-comm-1.onrender.com';
} else if (import.meta.env.PROD) {
  axios.defaults.baseURL = 'https://jewllery-e-comm-1.onrender.com';
}
// For local development, we rely on the proxy in vite.config.js, so no baseURL needed
// or it can be set to empty string or localhost if proxy is not used.
// But since we use proxy in dev, let's just set it for PROD.

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <WishlistProvider>
                <App />
              </WishlistProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
