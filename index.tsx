import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('SneakerVault: Initializing Application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("SneakerVault: Could not find root element to mount to");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('SneakerVault: Application Mounted Successfully');
  } catch (error) {
    console.error('SneakerVault: Render Error:', error);
  }
}