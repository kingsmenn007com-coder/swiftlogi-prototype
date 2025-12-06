import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Imports your main application logic
import './index.css'; // Imports your Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')).render(
    // Remove <React.StrictMode> for compatibility during initial setup
    <App /> 
);
