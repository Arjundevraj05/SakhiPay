import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/page-common.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UpiProvider } from './context/UPIContext.js';  // your provider

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UpiProvider>  
      <App />
    </UpiProvider>
  </React.StrictMode>
);

reportWebVitals();