import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.tsx';
import AdminPage from './AdminPage.tsx';
import { initSentry } from './monitoring/sentry.ts';

initSentry();

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required');
}

const page = window.location.pathname === '/admin' ? <AdminPage /> : <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      {page}
    </ClerkProvider>
  </StrictMode>,
);