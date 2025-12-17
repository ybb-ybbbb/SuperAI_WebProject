import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();
    
    // 监听storage变化，处理其他标签页的登录/登出
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🔄</div>
        <p>加载中...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default AuthGuard;