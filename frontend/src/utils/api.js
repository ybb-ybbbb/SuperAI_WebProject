// API工具函数

// 基础URL
const BASE_URL = 'http://localhost:8080/api';

// 获取token
const getToken = () => {
  return localStorage.getItem('token');
};

// 通用请求函数
const request = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `请求失败: ${response.status}`);
  }
  
  return response.json();
};

// 用户相关API
export const getUserInfo = async () => {
  return request('/user/info', {
    method: 'GET',
  });
};

// VIP相关API

// 更新自动续期状态
export const updateAutoRenew = async (userId, autoRenew) => {
  return request(`/user/${userId}/vip/auto-renew`, {
    method: 'PUT',
    body: JSON.stringify({ auto_renew: autoRenew }),
  });
};

// 获取VIP订单列表
export const getVipOrders = async (userId) => {
  return request(`/user/${userId}/vip/orders`, {
    method: 'GET',
  });
};

// 获取VIP历史记录
export const getVipHistory = async (userId) => {
  return request(`/user/${userId}/vip/records`, {
    method: 'GET',
  });
};

// 创建VIP订单
export const createVipOrder = async (userId, planId) => {
  return request(`/user/${userId}/vip/orders`, {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId }),
  });
};

// 获取VIP套餐列表
export const getVipPlans = async () => {
  return request('/vip/plans', {
    method: 'GET',
  });
};

// 获取用户VIP状态
export const getUserVipStatus = async (userId) => {
  return request(`/user/${userId}/vip`, {
    method: 'GET',
  });
};

// 检查用户VIP状态
export const checkUserVip = async (userId) => {
  return request(`/user/${userId}/vip/check`, {
    method: 'GET',
  });
};

// 同步用户VIP状态
export const syncUserVipStatus = async (userId) => {
  return request(`/user/${userId}/vip/sync`, {
    method: 'POST',
  });
};
