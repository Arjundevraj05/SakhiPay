import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UpiProvider } from './context/UPIContext.js';  // your provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UpiProvider>  
      <App />
    </UpiProvider>
  </React.StrictMode>
);

reportWebVitals();
