import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Deployment Verification Log
const VERSION = "1.0.6";
const DEPLOY_TIME = new Date().toISOString();
console.log(`SneakerVault [v${VERSION}]: Initializing...`);
console.log(`Build Timestamp: ${DEPLOY_TIME}`);

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('SneakerVault: Successfully rendered to DOM');
  } catch (err) {
    console.error('SneakerVault: Mounting Error:', err);
    container.innerHTML = `<div style="padding: 40px; text-align: center; font-family: sans-serif;">
      <h1 style="color: #ef4444;">Vault Connection Error</h1>
      <p>The application failed to start. Please check the browser console.</p>
      <pre style="background: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block; text-align: left;">${err instanceof Error ? err.message : String(err)}</pre>
    </div>`;
  }
} else {
  console.error('SneakerVault: Root element (#root) not found in the HTML document.');
}