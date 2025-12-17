const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'user_register',
      user: '张三',
      avatar: '👤',
      action: '注册了账号',
      time: '2分钟前',
      status: 'success'
    },
    {
      id: 2,
      type: 'system_update',
      user: '系统',
      avatar: '⚙️',
      action: '完成了系统更新',
      time: '1小时前',
      status: 'info'
    },
    {
      id: 3,
      type: 'user_login',
      user: '李四',
      avatar: '👤',
      action: '登录了系统',
      time: '3小时前',
      status: 'success'
    },
    {
      id: 4,
      type: 'user_logout',
      user: '王五',
      avatar: '👤',
      action: '退出了系统',
      time: '5小时前',
      status: 'info'
    },
    {
      id: 5,
      type: 'error',
      user: '系统',
      avatar: '🚨',
      action: '检测到异常登录尝试',
      time: '1天前',
      status: 'error'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'info':
        return '#3b82f6';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="recent-activity-container">
      <div className="section-header">
        <h2>最近活动</h2>
        <button className="view-all-button">查看全部</button>
      </div>
      <div className="activity-timeline">
        {activities.map((activity, index) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon" style={{ backgroundColor: getStatusColor(activity.status) + '20' }}>
              <span style={{ color: getStatusColor(activity.status) }}>{activity.avatar}</span>
            </div>
            <div className="activity-content">
              <div className="activity-info">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-action">{activity.action}</span>
              </div>
              <div className="activity-time">{activity.time}</div>
            </div>
            {index < activities.length - 1 && <div className="activity-line"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;