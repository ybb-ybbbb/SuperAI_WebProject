import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>用户认证系统</h1>
      </header>
      <main className="app-main">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            登录
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            注册
          </button>
        </div>
        <div className="auth-content">
          {activeTab === 'login' ? <Login /> : <Register />}
        </div>
      </main>
    </div>
  )
}

export default App
