import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ThemeProvider } from './components/ThemeProvider'
import './styles/theme.css'
import './index.css'
import App from './App.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Users from './pages/Users.jsx'
import Settings from './pages/Settings.jsx'
import Profile from './pages/Profile.jsx'
import VIP from './pages/VIP.jsx'
import AI from './pages/AI.jsx'
import AuthGuard from './components/AuthGuard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ConfigProvider locale={zhCN} theme={{
        token: {
          colorPrimary: '#1677ff',
        },
      }}>
        <BrowserRouter>
          <Routes>
            {/* 公开路由 */}
            <Route path="/" element={<App />} />
            
            {/* 受保护路由 */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/vip" element={<VIP />} />
            </Route>
            
            {/* 404页面 */}
            <Route path="*" element={<div>404页面</div>} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </ThemeProvider>
  </StrictMode>,
)
