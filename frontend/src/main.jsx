import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AuthGuard from './components/AuthGuard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/" element={<App />} />
        
        {/* 受保护路由 */}
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<div>用户管理页面</div>} />
          <Route path="/settings" element={<div>设置页面</div>} />
          <Route path="/profile" element={<div>个人资料页面</div>} />
        </Route>
        
        {/* 404页面 */}
        <Route path="*" element={<div>404页面</div>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
