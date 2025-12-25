import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  
  // 路由路径映射，用于生成面包屑
  const routeMap = {
    '/dashboard': '仪表盘',
    '/ai': 'AI功能',
    '/users': '用户管理',
    '/settings': '设置',
    '/profile': '个人资料',
    '/vip': 'VIP会员'
  };

  // 生成面包屑项
  const generateBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbItems = [];
    const addedPaths = new Set();
    
    // 添加首页
    const homePath = '/dashboard';
    breadcrumbItems.push({
      path: homePath,
      label: '首页'
    });
    addedPaths.add(homePath);
    
    // 添加当前路径的各个段
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      if (routeMap[currentPath] && !addedPaths.has(currentPath)) {
        breadcrumbItems.push({
          path: currentPath,
          label: routeMap[currentPath]
        });
        addedPaths.add(currentPath);
      }
    });
    
    return breadcrumbItems;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  return (
    <div className="breadcrumb-container">
      <div className="breadcrumb">
        {breadcrumbItems.map((item, index) => (
          <span key={item.path}>
            {index > 0 && <span className="breadcrumb-separator">/</span>}
            {index === breadcrumbItems.length - 1 ? (
              <span className="breadcrumb-item active">{item.label}</span>
            ) : (
              <Link to={item.path} className="breadcrumb-item">
                {item.label}
              </Link>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb;