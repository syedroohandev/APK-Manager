import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 👈 Yeh import karein
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* 👈 Poori app ko wrap karein */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);