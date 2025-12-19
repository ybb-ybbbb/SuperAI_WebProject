import { useState, useEffect, useCallback } from 'react';
import { FaCrown, FaStar } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { getVipOrders, getVipHistory, createVipOrder, getVipPlans, getUserInfo, updateAutoRenew } from '../utils/api';

const VIP = () => {
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

  // 订单和历史记录状态
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [vipPlans, setVipPlans] = useState([
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
  ]);

  // 自动续期状态
  const [autoRenew, setAutoRenew] = useState(false);
  
  // 标签页状态管理
  const [activeTab, setActiveTab] = useState('status');

  // 获取最新用户信息
  const fetchUserInfo = async () => {
    try {
      if (!user || !user.id) return;
      const userData = await getUserInfo(user.id);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        // 更新自动续期状态（如果存在）
        setAutoRenew(userData.auto_renew || false);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 处理自动续期开关变化
  const handleAutoRenewChange = async (e) => {
    const newValue = e.target.checked;
    try {
      setIsLoading(true);
      // 更新自动续期状态
      await updateAutoRenew(user.id, newValue);
      setAutoRenew(newValue);
      // 刷新用户信息
      await fetchUserInfo();
      alert(newValue ? '已开启自动续期' : '已关闭自动续期');
    } catch (error) {
      console.error('更新自动续期状态失败:', error);
      alert(`更新失败：${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取订单列表
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user) return;
      const ordersData = await getVipOrders(user.id);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 获取VIP历史记录
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user) return;
      const historyData = await getVipHistory(user.id);
      setHistory(historyData || []);
    } catch (error) {
      console.error('获取VIP历史记录失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 获取VIP套餐列表
  const fetchPlans = async () => {
    try {
      const plansData = await getVipPlans();
      console.log('获取到的VIP套餐数据:', plansData);
      if (plansData && Array.isArray(plansData)) {
        // 确保每个套餐都有features属性，并且是数组
        const formattedPlans = plansData.map(plan => ({
          ...plan,
          // 处理features：确保是数组，如果是字符串则解析
          features: typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || [])
        }));
        setVipPlans(formattedPlans);
      }
    } catch (error) {
      console.error('获取VIP套餐列表失败:', error);
    }
  };

  // 组件加载时获取最新用户信息和套餐列表
  useEffect(() => {
    fetchUserInfo();
    fetchPlans();
  }, []);

  // 标签页切换时获取对应数据
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchOrders, fetchHistory]);

  const handleSubscribe = async (plan) => {
    try {
      setIsLoading(true);
      
      if (!user) return;
      
      // 创建VIP订单
      console.log('创建VIP订单:', plan.id);
      const order = await createVipOrder(user.id, plan.id);
      
      // 刷新用户信息
      await fetchUserInfo();
      
      // 显示成功提示
      alert(`成功创建 ${plan.name} 计划订单！订单号：${order.order_no || 'N/A'}`);
      
    } catch (error) {
      console.error('订阅失败:', error);
      alert(`订阅失败：${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
          
          {/* 标签页导航 */}
          <div className="vip-tabs">
            <button 
              className={`tab-button ${activeTab === 'status' ? 'active' : ''}`}
              onClick={() => setActiveTab('status')}
            >
              会员状态
            </button>
            <button 
              className={`tab-button ${activeTab === 'plans' ? 'active' : ''}`}
              onClick={() => setActiveTab('plans')}
            >
              套餐选择
            </button>
            <button 
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              购买记录
            </button>
            <button 
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              历史记录
            </button>
          </div>
          
          {/* 会员状态标签页 */}
          {activeTab === 'status' && (
            <>
              {/* 用户当前VIP状态 */}
              <div className="vip-status-section">
                <div className="vip-status-card">
                  <h2>您的当前状态</h2>
                  {user.is_vip ? (
                    <div className="vip-active">
                      <div className="vip-badge-large"><FaCrown /></div>
                      <h3>尊贵VIP会员</h3>
                      <div className="auto-renew-section">
                        <div className="vip-expiry-info">
                          {user.vip_end_at && (
                            <p className="vip-expiry-date">有效期至：{new Date(user.vip_end_at).toLocaleDateString()}</p>
                          )}
                        </div>
                        <label className="auto-renew-label">
                          <input 
                            type="checkbox" 
                            className="auto-renew-checkbox"
                            checked={autoRenew}
                            onChange={handleAutoRenewChange}
                            disabled={isLoading}
                          />
                          开启自动续期
                        </label>
                        <p className="auto-renew-description">到期前自动续费，避免服务中断</p>
                      </div>
                      <button className="renew-button">续费会员</button>
                    </div>
                  ) : (
                    <div className="vip-inactive">
                      <div className="vip-badge-large"><FaStar /></div>
                      <h3>普通用户</h3>
                      <p>立即升级，享受更多权益</p>
                      <button className="upgrade-button" onClick={() => setActiveTab('plans')}>立即升级</button>
                    </div>
                  )}
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
            </>
          )}
          
          {/* 套餐选择标签页 */}
          {activeTab === 'plans' && (
            <div className="vip-plans-section">
              <h2>选择VIP套餐</h2>
              <div className="vip-plans-grid">
                {vipPlans.map((plan) => (
                  <div key={plan.id} className="vip-plan-card">
                    <div className="plan-header">
                      <h3>{plan.name}</h3>
                      <div className="plan-price">
                        <span className="price">¥{parseFloat(plan.price).toFixed(2)}</span>
                        <span className="duration">/{plan.duration}天</span>
                      </div>
                    </div>
                    <div className="plan-features">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          {typeof feature === 'string' ? feature : JSON.stringify(feature)}
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
          )}
          
          {/* 购买记录标签页 */}
          {activeTab === 'orders' && (
            <div className="vip-orders-section">
              <h2>购买记录</h2>
              <div className="vip-orders-list">
                {isLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner">🔄</div>
                    <p>加载中...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>订单号</th>
                        <th>套餐名称</th>
                        <th>金额</th>
                        <th>支付状态</th>
                        <th>创建时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.order_no || 'N/A'}</td>
                          <td>{order.plan_name || 'N/A'}</td>
                          <td>¥{order.amount || 0}</td>
                          <td>
                            <span className={`status-badge ${order.status === 'paid' ? 'success' : 'pending'}`}>
                              {order.status === 'paid' ? '已支付' : order.status === 'pending' ? '待支付' : order.status}
                            </span>
                          </td>
                          <td>
                            {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-data">
                    <p>暂无购买记录</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 历史记录标签页 */}
          {activeTab === 'history' && (
            <div className="vip-history-section">
              <h2>VIP历史记录</h2>
              <div className="vip-history-list">
                {isLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner">🔄</div>
                    <p>加载中...</p>
                  </div>
                ) : history.length > 0 ? (
                  <div className="history-timeline">
                    {history.map((record) => (
                      <div key={record.id} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h3>{record.plan_name || 'N/A'}</h3>
                            <span className={`status-badge ${record.status === 'active' ? 'success' : 'expired'}`}>
                              {record.status === 'active' ? '活跃中' : '已过期'}
                            </span>
                          </div>
                          <div className="timeline-body">
                            <p>开始时间：{record.start_time ? new Date(record.start_time).toLocaleDateString() : 'N/A'}</p>
                            <p>结束时间：{record.end_time ? new Date(record.end_time).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <p>暂无VIP历史记录</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VIP;