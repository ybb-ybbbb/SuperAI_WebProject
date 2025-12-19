import { useState, useEffect } from 'react';
import { FaCrown, FaStar } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const Profile = () => {
  const [user, setUser] = useState(() => {
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

  // 获取最新用户信息
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/user/info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('获取用户信息失败');
      }
      
      const data = await response.json();
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        // 如果返回的是用户列表，找到当前用户
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const currentUser = data.data.find(u => u.id === parsedUser.id);
          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        }
      } else if (data.data) {
        // 如果返回的是单个用户信息
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 组件加载时获取最新用户信息
  useEffect(() => {
    fetchUserInfo();
  }, []);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  
  // 编辑表单状态
  const [editForm, setEditForm] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        const parsedUser = JSON.parse(storedUser);
        return {
          username: parsedUser.username || '',
          email: parsedUser.email || '',
          fullName: parsedUser.fullName || '',
          phone: parsedUser.phone || '',
          bio: parsedUser.bio || '',
          avatar: parsedUser.avatar || '👤'
        };
      }
    } catch (error) {
      console.error('解析用户数据失败:', error);
    }
    return {
      username: '',
      email: '',
      fullName: '',
      phone: '',
      bio: '',
      avatar: '👤'
    };
  });
  
  // 修改密码表单状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // 处理编辑模式切换
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 处理密码表单输入变化
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
    setPasswordSuccess('');
  };
  
  // 处理保存个人资料
  const handleSaveProfile = () => {
    setIsSaving(true);
    // 模拟API调用
    setTimeout(() => {
      // 更新本地用户数据
      const updatedUser = { ...user, ...editForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setIsSaving(false);
      setIsEditing(false);
      setSaveSuccess('个人资料已保存');
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(''), 3000);
    }, 1000);
  };
  
  // 处理修改密码
  const handleChangePassword = () => {
    // 验证密码
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码长度不能少于6位');
      return;
    }
    
    setIsSaving(true);
    // 模拟API调用
    setTimeout(() => {
      setIsSaving(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordSuccess('密码已修改');
      // 3秒后清除成功提示
      setTimeout(() => setPasswordSuccess(''), 3000);
    }, 1000);
  };
  
  const tabs = [
    { id: 'info', name: '个人信息', icon: '👤' },
    { id: 'password', name: '修改密码', icon: '🔒' },
    { id: 'activity', name: '活动记录', icon: '📋' }
  ];
  
  if (!user) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <TopBar />
          <div className="content-area">
            <div className="loading-container">
              <div className="loading-spinner">🔄</div>
              <p>加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="content-area">
          <div className="page-header">
            <h1 className="page-title">个人资料</h1>
            <p className="page-description">管理您的个人信息和账户设置</p>
          </div>
          
          <div className="profile-container">
            {/* 个人资料概览 */}
            <div className="profile-overview">
              <div className="profile-avatar">
                <span className="avatar-icon">{user.avatar || '👤'}</span>
                {user.is_vip && (
                  <span className="vip-badge"><FaCrown /> VIP</span>
                )}
              </div>
              <div className="profile-basic-info">
                <h2 className="profile-name">
                  {user.username}
                  {user.is_vip && (
                    <span className="vip-tag"><FaCrown /> VIP</span>
                  )}
                </h2>
                <p className="profile-email">{user.email}</p>
              </div>
            </div>
            
            {/* 资料标签页 */}
            <div className="profile-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-name">{tab.name}</span>
                </button>
              ))}
            </div>
            
            {/* 资料内容 */}
            <div className="profile-content">
              {saveSuccess && (
                <div className="success-message">{saveSuccess}</div>
              )}
              
              {/* 个人信息 */}
              {activeTab === 'info' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>个人信息</h2>
                    {!isEditing && (
                      <button 
                        className="edit-button"
                        onClick={handleEditToggle}
                      >
                        编辑资料
                      </button>
                    )}
                  </div>
                  
                  <div className="profile-form">
                    {isEditing ? (
                      <div className="edit-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="username">用户名</label>
                            <input
                              type="text"
                              id="username"
                              name="username"
                              value={editForm.username}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="email">邮箱</label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={editForm.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="fullName">姓名</label>
                            <input
                              type="text"
                              id="fullName"
                              name="fullName"
                              value={editForm.fullName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="phone">电话</label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={editForm.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group full-width">
                            <label htmlFor="bio">个人简介</label>
                            <textarea
                              id="bio"
                              name="bio"
                              value={editForm.bio}
                              onChange={handleInputChange}
                              rows="4"
                              placeholder="介绍一下自己..."
                            ></textarea>
                          </div>
                        </div>
                        <div className="form-actions">
                          <button 
                            className="cancel-button"
                            onClick={handleEditToggle}
                          >
                            取消
                          </button>
                          <button 
                            className="save-button"
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                          >
                            {isSaving ? '保存中...' : '保存'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="info-display">
                        <div className="info-row">
                          <div className="info-label">用户名</div>
                          <div className="info-value">{user.username}</div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">邮箱</div>
                          <div className="info-value">{user.email}</div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">姓名</div>
                          <div className="info-value">{user.fullName || '未设置'}</div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">电话</div>
                          <div className="info-value">{user.phone || '未设置'}</div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">个人简介</div>
                          <div className="info-value">{user.bio || '未设置'}</div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">VIP状态</div>
                          <div className="info-value">
                            {user.is_vip ? (
                              <span className="vip-status-active">
                                <FaCrown /> 已开通VIP
                                {user.vip_end_at && (
                                  <span className="vip-expiry">
                                    （有效期至：{new Date(user.vip_end_at).toLocaleDateString()}）
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="vip-status-inactive">
                                📌 未开通VIP
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* 修改密码 */}
              {activeTab === 'password' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>修改密码</h2>
                  </div>
                  
                  <div className="password-form-container">
                    {passwordError && (
                      <div className="error-message">{passwordError}</div>
                    )}
                    {passwordSuccess && (
                      <div className="success-message">{passwordSuccess}</div>
                    )}
                    
                    <form className="password-form">
                      <div className="form-group">
                        <label htmlFor="currentPassword">当前密码</label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="newPassword">新密码</label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={6}
                          placeholder="至少6个字符"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="confirmPassword">确认新密码</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="form-actions">
                        <button 
                          type="button"
                          className="save-button"
                          onClick={handleChangePassword}
                          disabled={isSaving}
                        >
                          {isSaving ? '修改中...' : '修改密码'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {/* 活动记录 */}
              {activeTab === 'activity' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>活动记录</h2>
                  </div>
                  
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon">📱</div>
                      <div className="activity-content">
                        <div className="activity-title">登录系统</div>
                        <div className="activity-time">2分钟前</div>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">🔧</div>
                      <div className="activity-content">
                        <div className="activity-title">更新个人资料</div>
                        <div className="activity-time">1天前</div>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">🔐</div>
                      <div className="activity-content">
                        <div className="activity-title">修改密码</div>
                        <div className="activity-time">1周前</div>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">📧</div>
                      <div className="activity-content">
                        <div className="activity-title">邮箱验证</div>
                        <div className="activity-time">2周前</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;