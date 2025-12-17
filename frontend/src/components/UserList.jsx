import { useState, useEffect } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    is_vip: false
  });

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
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setEditFormData({
        username: userToEdit.username,
        email: userToEdit.email,
        is_vip: userToEdit.is_vip
      });
      setIsEditModalOpen(true);
    }
  };

  // 处理编辑表单提交
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/user/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: editFormData.username,
          email: editFormData.email
        })
      });
      
      if (!response.ok) {
        throw new Error('更新用户信息失败');
      }
      
      // 更新VIP状态（如果有变化）
      if (editFormData.is_vip !== editingUser.is_vip) {
        const vipResponse = await fetch(`http://localhost:8080/api/user/${editingUser.id}/vip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            is_vip: editFormData.is_vip,
            vip_start_at: new Date().toISOString(),
            vip_end_at: editFormData.is_vip ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
          })
        });
        
        if (!vipResponse.ok) {
          throw new Error('更新VIP状态失败');
        }
      }
      
      // 重新获取用户列表
      fetchUsers();
      
      // 如果修改的是当前登录用户，更新localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id === editingUser.id) {
          // 重新获取最新的用户信息
          const token = localStorage.getItem('token');
          const userResponse = await fetch('http://localhost:8080/api/user/info', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.data && Array.isArray(userData.data)) {
              const updatedUser = userData.data.find(u => u.id === parsedUser.id);
              if (updatedUser) {
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }
            }
          }
        }
      }
      
      setIsEditModalOpen(false);
      alert('用户信息更新成功');
    } catch (err) {
      setError(err.message);
    }
  };

  // 获取状态显示文本
  const getStatusText = (status) => {
    return status === 'active' ? '活跃' : '禁用';
  };

  // 获取VIP状态显示文本
  const getVipText = (isVip) => {
    return isVip ? 'VIP用户' : '普通用户';
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
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

      {/* 编辑用户模态框 */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>编辑用户</h2>
              <button 
                className="close-button"
                onClick={() => setIsEditModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="edit-form" onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={editFormData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">邮箱</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="is_vip"
                  name="is_vip"
                  checked={editFormData.is_vip}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_vip">VIP会员</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setIsEditModalOpen(false)}>
                  取消
                </button>
                <button type="submit" className="submit-button">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;