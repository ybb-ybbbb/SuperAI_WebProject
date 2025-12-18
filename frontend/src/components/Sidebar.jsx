import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      name: '仪表盘',
      path: '/dashboard',
      icon: '📊',
      isActive: location.pathname === '/dashboard'
    },
    {
      id: 'users',
      name: '用户管理',
      path: '/users',
      icon: '👥',
      isActive: location.pathname.startsWith('/users')
    },
    {
      id: 'settings',
      name: '设置',
      path: '/settings',
      icon: '⚙️',
      isActive: location.pathname === '/settings'
    },
    {
      id: 'profile',
      name: '个人资料',
      path: '/profile',
      icon: '👤',
      isActive: location.pathname === '/profile'
    },
    {
      id: 'vip',
      name: 'VIP会员',
      path: '/vip',
      icon: '⭐',
      isActive: location.pathname === '/vip'
    },
    {
      id: 'logout',
      name: '退出登录',
      path: '/logout',
      icon: '🚪',
      isActive: location.pathname === '/logout'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">系统管理</span>
        </h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`sidebar-nav-item ${item.isActive ? 'active' : ''}`}
            onClick={(e) => {
              if (item.id === 'logout') {
                e.preventDefault();
                handleLogout();
              }
            }}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-text">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-version">
          <span className="version-label">版本</span>
          <span className="version-number">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;