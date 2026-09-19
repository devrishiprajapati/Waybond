import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import '@fontsource/montserrat/latin-300.css'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-500.css'
import '@fontsource/montserrat/latin-600.css'
import '@fontsource/montserrat/latin-700.css'
import '@fontsource/montserrat/latin-800.css'
import '@fontsource/montserrat/latin-900.css'
import '@fontsource/montserrat/latin-300-italic.css'
import '@fontsource/montserrat/latin-400-italic.css'
import '@fontsource/montserrat/latin-500-italic.css'
import '@fontsource/montserrat/latin-600-italic.css'
import '@fontsource/montserrat/latin-700-italic.css'
import '@fontsource/montserrat/latin-800-italic.css'
import '@fontsource/montserrat/latin-900-italic.css'
import './index.css'

// Register Service Worker for PWA installability in production only.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.log('SW registration failed: ', error);
    });
  });
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations?.().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HelmetProvider>
            <ErrorBoundary>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ErrorBoundary>
        </HelmetProvider>
    </React.StrictMode>,
)
