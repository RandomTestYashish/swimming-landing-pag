import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Web fonts load without blocking first paint; the fallback stack carries
// the page until they arrive.
const webfont = document.getElementById('webfont') as HTMLLinkElement | null;
if (webfont) {
  const apply = () => { webfont.media = 'all'; };
  webfont.addEventListener('load', apply);
  setTimeout(apply, 1200);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
