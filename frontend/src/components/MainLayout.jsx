import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Dropdown, Avatar, Badge, Breadcrumb } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  RobotOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  CrownOutlined,
  LogoutOutlined,
  BellOutlined,
  MessageOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const breadcrumbNameMap = {
  '/dashboard': '仪表盘',
  '/users': '用户管理',
  '/settings': '设置',
  '/profile': '个人资料',
  '/vip': 'VIP会员',
  '/ai': 'AI功能',
  '/ollama': 'Ollama管理',
  '/ollama/chat': 'Ollama聊天',
  '/ollama/create': '创建模型',
  '/ollama/settings': 'Ollama设置',
};

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  })();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/ai', icon: <RobotOutlined />, label: 'AI功能' },
    { key: '/ollama', icon: <RobotOutlined />, label: 'Ollama管理', children: [
      { key: '/ollama', icon: <DashboardOutlined />, label: '模型列表' },
      { key: '/ollama/chat', icon: <MessageOutlined />, label: '聊天' },
      { key: '/ollama/create', icon: <PlusOutlined />, label: '创建模型' },
      { key: '/ollama/settings', icon: <SettingOutlined />, label: '配置' },
    ]},
    { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
    { key: '/vip', icon: <CrownOutlined />, label: 'VIP会员' },
    { key: '/settings', icon: <SettingOutlined />, label: '设置' },
    { key: '/profile', icon: <UserOutlined />, label: '个人资料' },
  ];

  const userMenu = {
    items: [
      { 
        key: 'profile', 
        label: '个人资料', 
        icon: <UserOutlined />, 
        onClick: () => navigate('/profile') 
      },
      { 
        key: 'vip', 
        label: 'VIP会员', 
        icon: <CrownOutlined />, 
        onClick: () => navigate('/vip') 
      },
      { 
        type: 'divider' 
      },
      { 
        key: 'logout', 
        label: '退出登录', 
        icon: <LogoutOutlined />, 
        danger: true, 
        onClick: handleLogout 
      },
    ]
  };

  // 生成面包屑项
  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return {
        key: url,
        title: <Link to={url}>{breadcrumbNameMap[url] || url}</Link>,
      };
    });
    
    return [
      {
        key: 'home',
        title: <Link to="/dashboard">首页</Link>,
      },
      ...extraBreadcrumbItems,
    ];
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="light" 
        width={250}
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          zIndex: 10
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderBottom: '1px solid #f0f0f0' 
        }}>
          <span style={{ fontSize: 24, marginRight: collapsed ? 0 : 8 }}>🚀</span>
          {!collapsed && (
            <span style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color: '#1677ff',
              letterSpacing: '0.5px'
            }}>
              SuperAI Admin
            </span>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, padding: '8px 0' }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          zIndex: 9,
          height: 64
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 48, height: 48, marginRight: 16 }}
            />
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Badge count={2} size="small" offset={[-2, 2]}>
              <Button type="text" icon={<BellOutlined />} shape="circle" size="large" />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'background 0.3s' }} className="hover:bg-gray-100">
                <Avatar 
                  style={{ backgroundColor: '#1677ff' }} 
                  icon={<UserOutlined />} 
                  src={user.avatar} 
                />
                <span style={{ marginLeft: 8, fontWeight: 500 }}>
                  {user.username || 'Admin'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px',
            minHeight: 280,
            background: 'transparent',
            overflowY: 'auto',
            height: 'calc(100vh - 64px - 48px)' // 减去header高度和margin
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

