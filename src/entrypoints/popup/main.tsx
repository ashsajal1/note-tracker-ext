import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { isFullView } from '@/hooks/use-full-view';
import App from './App';
import './popup.css';

if (isFullView()) {
  document.documentElement.classList.add('full-view');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
