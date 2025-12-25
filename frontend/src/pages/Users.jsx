import UserList from '../components/UserList';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Users = () => {
  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginTop: 0 }}>用户管理</Title>
        <Paragraph type="secondary">管理系统用户，包括添加、编辑、删除和禁用用户</Paragraph>
      </div>
      <Card bordered={false} className="shadow-sm">
        <UserList />
      </Card>
    </div>
  );
};

export default Users;