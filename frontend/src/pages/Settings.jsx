import { useState } from 'react';
import { Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

const Settings = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [settings, setSettings] = useState({
    system: {
      siteName: '系统管理',
      siteLogo: '🚀',
      language: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: 'HH:mm:ss'
    },
    security: {
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      enable2FA: false
    },
    notification: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notificationSound: true,
      dailyDigest: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleSave = () => {
    setIsSaving(true);
    // 模拟API调用
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess('设置已保存');
      // 3秒后清除成功提示
      setTimeout(() => setSaveSuccess(''), 3000);
    }, 1000);
  };

  const handleInputChange = (tab, field, value) => {
    setSettings(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'system', name: '系统设置', icon: '⚙️' },
    { id: 'security', name: '安全设置', icon: '🔒' },
    { id: 'notification', name: '通知设置', icon: '🔔' }
  ];

  return (
    <div className="settings-page-container">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginTop: 0 }}>设置</Title>
        <Paragraph type="secondary">管理系统设置，包括系统配置、安全设置和通知设置</Paragraph>
      </div>
      
      <div className="settings-container">
            {/* 设置标签页 */}
            <div className="settings-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-name">{tab.name}</span>
                </button>
              ))}
            </div>
            
            {/* 设置内容 */}
            <div className="settings-content">
              {saveSuccess && (
                <div className="success-message">{saveSuccess}</div>
              )}
              
              {/* 系统设置 */}
              {activeTab === 'system' && (
                <div className="settings-section">
                  <h2>系统设置</h2>
                  <div className="settings-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="siteName">网站名称</label>
                        <input
                          type="text"
                          id="siteName"
                          value={settings.system.siteName}
                          onChange={(e) => handleInputChange('system', 'siteName', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="siteLogo">网站Logo</label>
                        <input
                          type="text"
                          id="siteLogo"
                          value={settings.system.siteLogo}
                          onChange={(e) => handleInputChange('system', 'siteLogo', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="language">语言</label>
                        <select
                          id="language"
                          value={settings.system.language}
                          onChange={(e) => handleInputChange('system', 'language', e.target.value)}
                        >
                          <option value="zh-CN">简体中文</option>
                          <option value="en-US">English</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="timeZone">时区</label>
                        <select
                          id="timeZone"
                          value={settings.system.timeZone}
                          onChange={(e) => handleInputChange('system', 'timeZone', e.target.value)}
                        >
                          <option value="Asia/Shanghai">Asia/Shanghai</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="dateFormat">日期格式</label>
                        <input
                          type="text"
                          id="dateFormat"
                          value={settings.system.dateFormat}
                          onChange={(e) => handleInputChange('system', 'dateFormat', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="timeFormat">时间格式</label>
                        <input
                          type="text"
                          id="timeFormat"
                          value={settings.system.timeFormat}
                          onChange={(e) => handleInputChange('system', 'timeFormat', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 安全设置 */}
              {activeTab === 'security' && (
                <div className="settings-section">
                  <h2>安全设置</h2>
                  <div className="settings-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="passwordExpiry">密码过期天数</label>
                        <input
                          type="number"
                          id="passwordExpiry"
                          value={settings.security.passwordExpiry}
                          onChange={(e) => handleInputChange('security', 'passwordExpiry', parseInt(e.target.value))}
                          min="1"
                          max="365"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="maxLoginAttempts">最大登录尝试次数</label>
                        <input
                          type="number"
                          id="maxLoginAttempts"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="sessionTimeout">会话超时时间（分钟）</label>
                        <input
                          type="number"
                          id="sessionTimeout"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          min="5"
                          max="120"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="enable2FA">启用两步验证</label>
                        <div className="checkbox-group">
                          <input
                            type="checkbox"
                            id="enable2FA"
                            checked={settings.security.enable2FA}
                            onChange={(e) => handleInputChange('security', 'enable2FA', e.target.checked)}
                          />
                          <label htmlFor="enable2FA">启用</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 通知设置 */}
              {activeTab === 'notification' && (
                <div className="settings-section">
                  <h2>通知设置</h2>
                  <div className="settings-form">
                    <div className="form-row">
                      <div className="form-group">
                        <div className="checkbox-group">
                          <input
                            type="checkbox"
                            id="emailNotifications"
                            checked={settings.notification.emailNotifications}
                            onChange={(e) => handleInputChange('notification', 'emailNotifications', e.target.checked)}
                          />
                          <label htmlFor="emailNotifications">启用邮件通知</label>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="checkbox-group">
                          <input
                            type="checkbox"
                            id="smsNotifications"
                            checked={settings.notification.smsNotifications}
                            onChange={(e) => handleInputChange('notification', 'smsNotifications', e.target.checked)}
                          />
                          <label htmlFor="smsNotifications">启用短信通知</label>
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <div className="checkbox-group">
                          <input
                            type="checkbox"
                            id="pushNotifications"
                            checked={settings.notification.pushNotifications}
                            onChange={(e) => handleInputChange('notification', 'pushNotifications', e.target.checked)}
                          />
                          <label htmlFor="pushNotifications">启用推送通知</label>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="checkbox-group">
                          <input
                            type="checkbox"
                            id="notificationSound"
                            checked={settings.notification.notificationSound}
                            onChange={(e) => handleInputChange('notification', 'notificationSound', e.target.checked)}
                          />
                          <label htmlFor="notificationSound">启用通知声音</label>
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <div className="checkbox-group">
                          <input
                            type="checkbox"
                            id="dailyDigest"
                            checked={settings.notification.dailyDigest}
                            onChange={(e) => handleInputChange('notification', 'dailyDigest', e.target.checked)}
                          />
                          <label htmlFor="dailyDigest">接收每日摘要</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 保存按钮 */}
              <div className="settings-footer">
                <button
                  className="save-button"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? '保存中...' : '保存设置'}
                </button>
              </div>
            </div>
      </div>
    </div>
  );
};

export default Settings;