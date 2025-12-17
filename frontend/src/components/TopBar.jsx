import { useState } from 'react';

const TopBar = () => {
  const [user, _setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('解析用户数据失败:', error);
      localStorage.removeItem('user');
    }
    return null;
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: '新用户注册',
      message: '张三刚刚注册了账号',
      time: '2分钟前',
      read: false
    },
    {
      id: 2,
      title: '系统更新',
      message: '系统已完成更新，新增了多项功能',
      time: '1小时前',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">仪表盘</h1>
      </div>
      <div className="topbar-right">
        <div className="topbar-icons">
          <div className="notification-container">
            <button 
              className="topbar-icon-button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h3>通知</h3>
                  <button className="mark-all-read">全部已读</button>
                </div>
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    >
                      <div className="notification-content">
                        <h4 className="notification-title">{notification.title}</h4>
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <button className="view-all">查看全部</button>
                </div>
              </div>
            )}
          </div>
          
          <div className="user-menu-container">
            <button 
              className="topbar-icon-button user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() || '👤'}
              </span>
              <span className="user-name">{user?.username || '用户'}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar-large">
                    {user?.username?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <div className="user-details">
                    <h3>{user?.username || '用户'}</h3>
                    <p>{user?.email || '未设置邮箱'}</p>
                  </div>
                </div>
                <div className="user-menu-items">
                  <button className="menu-item">
                    <span className="item-icon">👤</span>
                    <span className="item-text">个人资料</span>
                  </button>
                  <button className="menu-item" onClick={() => window.location.href = '/vip'}>
                    <span className="item-icon">⭐</span>
                    <span className="item-text">VIP会员</span>
                  </button>
                  <button className="menu-item">
                    <span className="item-icon">⚙️</span>
                    <span className="item-text">设置</span>
                  </button>
                  <button 
                    className="menu-item logout"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/';
                    }}
                  >
                    <span className="item-icon">🚪</span>
                    <span className="item-text">退出登录</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;