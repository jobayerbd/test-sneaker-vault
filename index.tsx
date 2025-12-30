import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log('SneakerVault: Initializing Application...');

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("SneakerVault: Root element not found.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('SneakerVault: Application Mounted');
  } catch (error) {
    console.error('SneakerVault: Render Error:', error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">Failed to load SneakerVault. Check console for details.</div>`;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}