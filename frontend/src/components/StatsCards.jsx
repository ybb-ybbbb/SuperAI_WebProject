import { useState, useEffect } from 'react';
import { getUserCount } from '../utils/api';

const StatsCards = () => {
  const [stats, setStats] = useState([
    {
      id: 1,
      title: '总用户数',
      value: 0,
      icon: '👥',
      color: '#646cff',
      trend: '+12%',
      trendType: 'up',
      description: '较上月增长12%'
    },
    {
      id: 2,
      title: '今日活跃用户',
      value: 45,
      icon: '📱',
      color: '#10b981',
      trend: '+8%',
      trendType: 'up',
      description: '较昨日增长8%'
    },
    {
      id: 3,
      title: '系统运行时间',
      value: '24天',
      icon: '⏰',
      color: '#f59e0b',
      trend: '100%',
      trendType: 'up',
      description: '稳定运行'
    },
    {
      id: 4,
      title: '待处理任务',
      value: 12,
      icon: '📋',
      color: '#ef4444',
      trend: '+3',
      trendType: 'up',
      description: '需要及时处理'
    }
  ]);

  useEffect(() => {
    // 获取真实用户总数
    const fetchUserCount = async () => {
      try {
        const response = await getUserCount();
        setStats(prev => prev.map(stat => {
          if (stat.id === 1) {
            return { ...stat, value: response.data };
          }
          return stat;
        }));
      } catch (error) {
        console.error('获取用户总数失败:', error);
      }
    };

    fetchUserCount();
  }, []);

  return (
    <div className="stats-cards-container">
      {stats.map((stat) => (
        <div key={stat.id} className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-title">{stat.title}</div>
            <div className="stat-card-icon" style={{ backgroundColor: stat.color + '20' }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
          </div>
          <div className="stat-card-body">
            <div className="stat-card-value">{stat.value}</div>
            <div className={`stat-card-trend ${stat.trendType}`}>
              {stat.trendType === 'up' ? '↑' : '↓'} {stat.trend}
            </div>
          </div>
          <div className="stat-card-footer">
            <div className="stat-card-description">{stat.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;