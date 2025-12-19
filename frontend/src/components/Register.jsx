import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSmile, FaRegMeh, FaCheckCircle } from 'react-icons/fa';
import { register } from '../utils/api';
import './AuthMacaron.css';

const Register = ({ onTabChange }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = '用户名不能为空';
    }
    
    if (!email.trim()) {
      errors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '请输入有效的邮箱地址';
    }
    
    if (!password) {
      errors.password = '密码不能为空';
    } else if (password.length < 6) {
      errors.password = '密码长度不能少于6位';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(username, password, email);
      
      setSuccess('注册成功，正在跳转到登录页面...');
      setTimeout(() => {
        window.location.hash = '#login';
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err) {
      let errorMessage = '注册失败';
      if (err.message === 'Failed to fetch') {
        errorMessage = '网络连接失败，请检查网络设置或服务器是否正常运行';
      } else if (err.message.includes('NetworkError')) {
        errorMessage = '网络连接异常，请稍后重试';
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    switch (field) {
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
    }
    
    if (formErrors[field]) {
      validateForm();
    }
  };

  return (
    <div className="auth-container-macaron register-macaron">
      <h2 className="auth-title-macaron">创建新账户</h2>
      <p className="auth-subtitle-macaron">加入我们，开启美好体验</p>
      
      <form onSubmit={handleSubmit} className="auth-form-macaron">
        <div className="form-group-macaron">
          <label htmlFor="username" className="form-label-macaron">
            <FaUser className="label-icon" />
            用户名
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
            placeholder="请输入用户名"
            className="form-input-macaron"
          />
          {formErrors.username && (
            <div className="field-error-macaron">
              <FaRegMeh className="error-icon-small" />
              {formErrors.username}
            </div>
          )}
        </div>

        <div className="form-group-macaron">
          <label htmlFor="email" className="form-label-macaron">
            <FaEnvelope className="label-icon" />
            邮箱地址
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            placeholder="your@email.com"
            className="form-input-macaron"
          />
          {formErrors.email && (
            <div className="field-error-macaron">
              <FaRegMeh className="error-icon-small" />
              {formErrors.email}
            </div>
          )}
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
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              minLength={6}
              placeholder="至少6位字符"
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
          {formErrors.password && (
            <div className="field-error-macaron">
              <FaRegMeh className="error-icon-small" />
              {formErrors.password}
            </div>
          )}
        </div>

        <div className="form-group-macaron">
          <label htmlFor="confirmPassword" className="form-label-macaron">
            <FaCheckCircle className="label-icon" />
            确认密码
          </label>
          <div className="password-wrapper-macaron">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              minLength={6}
              placeholder="再次输入密码"
              className="form-input-macaron"
            />
            <button
              type="button"
              className="password-toggle-macaron"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <div className="field-error-macaron">
              <FaRegMeh className="error-icon-small" />
              {formErrors.confirmPassword}
            </div>
          )}
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
          className="submit-button-macaron register-button-macaron"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="button-loading">注册中...</span>
          ) : (
            '立即注册'
          )}
        </button>
      </form>

      <div className="auth-footer-macaron">
        <p>已有账号？ 
          <span 
            className="auth-link-macaron" 
            onClick={() => onTabChange('login')}
          >
            返回登录
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;