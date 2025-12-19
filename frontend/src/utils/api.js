// API工具函数

// 基础URL - 使用相对路径，通过Vite代理转发
const BASE_URL = '';

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
  
  const responseData = await response.json().catch(() => ({}));
  
  if (!response.ok || !responseData.success) {
    throw new Error(responseData.message || `请求失败: ${response.status}`);
  }
  
  return responseData.data;
};

// 用户相关API
export const getUserInfo = async (userId) => {
  return request(`/api/user/${userId}`, {
    method: 'GET',
  });
};

// 获取用户列表API
export const getUsers = async (page = 1, pageSize = 10) => {
  return request(`/api/users?page=${page}&page_size=${pageSize}`, {
    method: 'GET',
  });
};

// VIP相关API

// 获取当前用户信息 - 注意：需要根据实际登录状态获取userId
export const getCurrentUser = async () => {
  // 这里假设从localStorage获取userId，实际实现可能需要调整
  const userId = localStorage.getItem('userId');
  if (!userId) {
    throw new Error('未找到用户ID');
  }
  return request(`/api/user/${userId}`, {
    method: 'GET',
  });
};

// 获取VIP订单列表
export const getVipOrders = async (userId, page = 1, pageSize = 10) => {
  return request(`/api/user/${userId}/vip/orders?page=${page}&page_size=${pageSize}`, {
    method: 'GET',
  });
};

// 获取VIP历史记录
export const getVipHistory = async (userId, page = 1, pageSize = 10) => {
  return request(`/api/user/${userId}/vip/records?page=${page}&page_size=${pageSize}`, {
    method: 'GET',
  });
};

// 创建VIP订单
export const createVipOrder = async (userId, planId) => {
  return request(`/api/user/${userId}/vip/orders`, {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId }),
  });
};

// 获取VIP套餐列表
export const getVipPlans = async () => {
  return request('/api/vip/plans', {
    method: 'GET',
  });
};

// 获取用户VIP状态
export const getUserVipStatus = async (userId) => {
  return request(`/api/user/${userId}/vip`, {
    method: 'GET',
  });
};

// 检查用户VIP状态
export const checkUserVip = async (userId) => {
  return request(`/api/user/${userId}/vip/check`, {
    method: 'GET',
  });
};

// 同步用户VIP状态
export const syncUserVipStatus = async (userId) => {
  return request(`/api/user/${userId}/vip/sync`, {
    method: 'POST',
  });
};

// 注册API
export const register = async (username, password, email) => {
  return request('/api/user/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, email }),
  });
};

// 登录API
export const login = async (username, email, password) => {
  return request('/api/user/login', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
};

// 更新用户信息API
export const updateUserInfo = async (userId, username, email, avatar) => {
  return request(`/api/user/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ username, email, avatar }),
  });
};

// 更新用户密码API
export const updateUserPassword = async (userId, oldPassword, newPassword) => {
  return request(`/api/user/${userId}/password`, {
    method: 'PUT',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
};

// 获取用户总数API
export const getUserCount = async () => {
  return request('/api/users/count', {
    method: 'GET',
  });
};

// 更新自动续期状态API
export const updateAutoRenew = async (userId, autoRenew) => {
  return request(`/api/user/${userId}/vip/auto-renew`, {
    method: 'PUT',
    body: JSON.stringify({ auto_renew: autoRenew }),
  });
};

// 获取用户详细信息API
export const getUser = async (userId) => {
  return request(`/api/user/${userId}/detail`, {
    method: 'GET',
  });
};

// 删除用户API
export const deleteUser = async (userId) => {
  return request(`/api/user/${userId}`, {
    method: 'DELETE',
  });
};

// 更新用户VIP状态API
export const updateUserVip = async (userId, isVip, vipExpires) => {
  return request(`/api/user/${userId}/vip`, {
    method: 'POST',
    body: JSON.stringify({ is_vip: isVip, vip_expires: vipExpires }),
  });
};

// 获取用户活跃VIP记录API
export const getUserActiveVipRecord = async (userId) => {
  return request(`/api/user/${userId}/vip/active`, {
    method: 'GET',
  });
};

// 获取单个VIP套餐API
export const getVipPlan = async (planId) => {
  return request(`/api/vip/plans/${planId}`, {
    method: 'GET',
  });
};

// 创建VIP套餐API
export const createVipPlan = async (name, description, price, durationDays) => {
  return request('/api/vip/plans', {
    method: 'POST',
    body: JSON.stringify({ name, description, price, duration_days: durationDays }),
  });
};
