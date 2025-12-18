import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <div className="app-container">
      <main className="app-main">
        <div className="auth-card-wrapper">
          <div className="auth-card-header">
            <h1 className="app-logo">SuperAI</h1>
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
          </div>
          <div className="auth-content">
            {activeTab === 'login' ? <Login onTabChange={setActiveTab} /> : <Register onTabChange={setActiveTab} />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
