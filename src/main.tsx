import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initDb } from './lib/db'

// 初始化数据库
initDb().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}).catch(error => {
  console.error('Failed to initialize database:', error);
});