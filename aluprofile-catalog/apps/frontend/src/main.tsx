import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.tsx';
import AdminPage from './AdminPage.tsx';
import CustomerPage from './CustomerPage.tsx';
import { initSentry } from './monitoring/sentry.ts';

initSentry();

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required');
}

const pathname = window.location.pathname;
const page = pathname === '/admin' ? <AdminPage /> : pathname === '/customer' ? <CustomerPage /> : <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      {page}
    </ClerkProvider>
  </StrictMode>,
);
