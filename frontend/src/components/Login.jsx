import { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSmile, FaRegMeh } from 'react-icons/fa';
import './AuthMacaron.css';

const Login = ({ onTabChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '登录失败');
      }
      
      const data = await response.json();
      
      const token = data.data?.token || data.token;
      const user = data.data?.user || data.data;
      
      if (!token || !user) {
        throw new Error('登录失败：缺少token或用户信息');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setSuccess('登录成功，正在跳转...');
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container-macaron">
      <h2 className="auth-title-macaron">欢迎回来</h2>
      <p className="auth-subtitle-macaron">登录您的账户，继续精彩旅程</p>
      
      <form onSubmit={handleSubmit} className="auth-form-macaron">
        <div className="form-group-macaron">
          <label htmlFor="email" className="form-label-macaron">
            <FaEnvelope className="label-icon" />
            邮箱地址
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="form-input-macaron"
          />
        </div>

        <div className="form-group-macaron">
          <label htmlFor="password" className="form-label-macaron">
            <FaLock className="label-icon" />
            密码
          </label>
          <div className="password-wrapper-macaron">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="form-input-macaron"
            />
            <button
              type="button"
              className="password-toggle-macaron"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {error && (
          <div className="message-macaron error-macaron">
            <FaRegMeh className="message-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="message-macaron success-macaron">
            <FaSmile className="message-icon" />
            <span>{success}</span>
          </div>
        )}

        <button 
          type="submit" 
          className="submit-button-macaron"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="button-loading">登录中...</span>
          ) : (
            '登录'
          )}
        </button>
      </form>

      <div className="auth-footer-macaron">
        <p>还没有账号？ 
          <span 
            className="auth-link-macaron" 
            onClick={() => onTabChange('register')}
          >
            立即注册
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;