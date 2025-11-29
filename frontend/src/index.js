import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// --- NUEVO CÓDIGO AMPLIFY ---
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_iiKt4sbmq', 
      userPoolClientId: '73u28vd0duu85uogab8ls32j51', 
    }
  }
});
// ----------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
