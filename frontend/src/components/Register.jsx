import { useState } from 'react';

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

  // 表单验证函数
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
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '注册失败');
      }
      
      setSuccess('注册成功，正在跳转到登录页面...');
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        // 切换到登录标签
        window.location.hash = '#login';
        // 清空表单
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err) {
      // 提供更友好的错误信息
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

  // 实时验证
  const handleInputChange = (field, value) => {
    // 更新字段值
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
    
    // 实时验证
    if (formErrors[field]) {
      validateForm();
    }
  };

  return (
    <div className="auth-container">
      <h2>注册</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">用户名</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
            placeholder="请输入用户名"
          />
          {formErrors.username && <div className="form-error">{formErrors.username}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="email">邮箱</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            placeholder="请输入邮箱"
          />
          {formErrors.email && <div className="form-error">{formErrors.email}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              minLength={6}
              placeholder="请输入密码"
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '隐藏' : '显示'}
            </button>
          </div>
          {formErrors.password && <div className="form-error">{formErrors.password}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">确认密码</label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              minLength={6}
              placeholder="请确认密码"
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '隐藏' : '显示'}
            </button>
          </div>
          {formErrors.confirmPassword && <div className="form-error">{formErrors.confirmPassword}</div>}
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? '注册中...' : '注册'}
        </button>
      </form>
      <div className="auth-switch">
        <p>已有账号？ <span className="auth-switch-link" onClick={() => onTabChange('login')}>登录</span></p>
      </div>
    </div>
  );
};

export default Register;