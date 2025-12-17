import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import UserList from '../components/UserList';

const Users = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="content-area">
          <div className="page-header">
            <h1 className="page-title">用户管理</h1>
            <p className="page-description">管理系统用户，包括添加、编辑、删除和禁用用户</p>
          </div>
          <UserList />
        </div>
      </div>
    </div>
  );
};

export default Users;