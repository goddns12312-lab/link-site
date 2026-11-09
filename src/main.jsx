import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const VALID_THEMES = [
  'green', 'dark-gold', 'neon', 'blue-royal',
  'obsidian-gold', 'aurora', 'crimson', 'holographic', 'emerald-noir', 'sunset',
];
const DEFAULT_THEME = 'holographic';
const params = new URLSearchParams(window.location.search);
const theme = params.get('theme');
document.documentElement.setAttribute(
  'data-theme',
  theme && VALID_THEMES.includes(theme) ? theme : DEFAULT_THEME,
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
