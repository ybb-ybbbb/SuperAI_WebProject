import { useState, useEffect } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取用户数据
  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('获取用户列表失败');
      }
      
      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 初始化时获取用户数据
  useEffect(() => {
    fetchUsers();
  }, []);

  // 过滤用户
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 分页逻辑
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // 处理删除用户
  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/user/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('删除用户失败');
        }
        
        // 重新获取用户列表
        fetchUsers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // 处理状态切换 - 暂时注释，因为后端不支持此功能
  /*
  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const user = users.find(u => u.id === id);
      if (!user) return;
      
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`http://localhost:8080/api/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('更新用户状态失败');
      }
      
      // 重新获取用户列表
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };
  */

  // 处理编辑用户
  const handleEdit = (id) => {
    // 这里可以打开编辑模态框或跳转到编辑页面
    console.log('编辑用户:', id);
  };

  // 获取状态显示文本
  const getStatusText = (status) => {
    return status === 'active' ? '活跃' : '禁用';
  };

  // 获取VIP状态显示文本
  const getVipText = (isVip) => {
    return isVip ? 'VIP用户' : '普通用户';
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
        <button className="add-user-button">
          + 添加用户
        </button>
      </div>
      
      {/* 错误信息 */}
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {/* 加载状态 */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner">🔄</div>
          <p>加载用户数据中...</p>
        </div>
      ) : (
        <>
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>邮箱</th>
                  <th>角色</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <tr key={user.id} className="user-row">
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.is_vip ? 'vip' : 'user'}`}>
                          {getVipText(user.is_vip)}
                        </span>
                      </td>
                      <td>
                        <span className="user-role">
                          {user.is_vip ? 'VIP' : '普通用户'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="action-buttons">
                        <button 
                          className="edit-button"
                          onClick={() => handleEdit(user.id)}
                        >
                          编辑
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDelete(user.id)}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {searchTerm ? '未找到匹配的用户' : '暂无用户数据'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                上一页
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                className="page-button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserList;