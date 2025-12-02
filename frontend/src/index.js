import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// --- NUEVO CÓDIGO AMPLIFY ---
import { Amplify } from 'aws-amplify';

// ----------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
