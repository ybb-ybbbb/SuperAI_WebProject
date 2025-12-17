import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const VIP = () => {
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
  
  const vipPlans = [
    {
      id: 1,
      name: '月度VIP',
      price: 19.9,
      duration: 30,
      features: [
        '✅ 无广告体验',
        '✅ 优先客服支持',
        '✅ 每月10GB存储空间',
        '✅ 高级功能解锁'
      ]
    },
    {
      id: 2,
      name: '季度VIP',
      price: 49.9,
      duration: 90,
      features: [
        '✅ 无广告体验',
        '✅ 优先客服支持',
        '✅ 每月20GB存储空间',
        '✅ 高级功能解锁',
        '✅ 专属徽章展示'
      ]
    },
    {
      id: 3,
      name: '年度VIP',
      price: 149.9,
      duration: 365,
      features: [
        '✅ 无广告体验',
        '✅ 优先客服支持',
        '✅ 每月50GB存储空间',
        '✅ 高级功能解锁',
        '✅ 专属徽章展示',
        '✅ 专属活动邀请',
        '✅ 免费升级新功能'
      ]
    }
  ];

  const handleSubscribe = (plan) => {
    console.log('订阅VIP计划:', plan);
    // 这里可以添加订阅逻辑，调用后端API
    alert(`已选择 ${plan.name} 计划，价格：${plan.price} 元`);
  };

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
            <h1 className="page-title">VIP会员中心</h1>
            <p className="page-description">升级VIP会员，享受更多专属权益</p>
          </div>
          
          {/* 用户当前VIP状态 */}
          <div className="vip-status-section">
            <div className="vip-status-card">
              <h2>您的当前状态</h2>
              {user.isVip ? (
                <div className="vip-active">
                  <div className="vip-badge-large">⭐</div>
                  <h3>尊贵VIP会员</h3>
                  {user.vipEndAt && (
                    <p>有效期至：{new Date(user.vipEndAt).toLocaleDateString()}</p>
                  )}
                  <button className="renew-button">续费会员</button>
                </div>
              ) : (
                <div className="vip-inactive">
                  <div className="vip-badge-large">📌</div>
                  <h3>普通用户</h3>
                  <p>立即升级，享受更多权益</p>
                  <button className="upgrade-button">立即升级</button>
                </div>
              )}
            </div>
          </div>
          
          {/* VIP套餐选择 */}
          <div className="vip-plans-section">
            <h2>选择VIP套餐</h2>
            <div className="vip-plans-grid">
              {vipPlans.map((plan) => (
                <div key={plan.id} className="vip-plan-card">
                  <div className="plan-header">
                    <h3>{plan.name}</h3>
                    <div className="plan-price">
                      <span className="price">¥{plan.price}</span>
                      <span className="duration">/{plan.duration}天</span>
                    </div>
                  </div>
                  <div className="plan-features">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button 
                    className="subscribe-button"
                    onClick={() => handleSubscribe(plan)}
                  >
                    立即订阅
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* VIP权益说明 */}
          <div className="vip-benefits-section">
            <h2>VIP会员权益</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">🚫</div>
                <h3>无广告体验</h3>
                <p>享受纯净的使用体验，告别所有广告干扰</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">💬</div>
                <h3>优先客服支持</h3>
                <p>获得专属客服通道，优先处理您的问题</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">💾</div>
                <h3>更多存储空间</h3>
                <p>获得更大的存储空间，满足您的存储需求</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🔓</div>
                <h3>高级功能解锁</h3>
                <p>解锁所有高级功能，提升您的使用体验</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🏆</div>
                <h3>专属徽章展示</h3>
                <p>在个人资料中展示专属VIP徽章，彰显尊贵身份</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🎉</div>
                <h3>专属活动邀请</h3>
                <p>获得平台专属活动邀请，参与更多精彩活动</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VIP;