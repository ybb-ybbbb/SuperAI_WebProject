import React, { useState, useEffect } from 'react';
import { Card, Button, List, Typography, Space, Tag, Spin, Alert, Row, Col, Modal, Empty } from 'antd';
import { MessageOutlined, SettingOutlined, DeleteOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getLocalModels, deleteModel } from '../utils/ollama';

const { Title, Text } = Typography;

const OllamaDashboard = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLocalModels();
      setModels(data || []);
    } catch (err) {
      setError('获取模型列表失败，请检查Ollama服务是否运行');
      console.error('获取模型列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleChat = (modelName) => {
    navigate(`/ollama/chat?model=${modelName}`);
  };

  const handleSettings = (modelName) => {
    navigate(`/ollama/settings?model=${modelName}`);
  };

  const handleDelete = async (modelName) => {
    try {
      await deleteModel(modelName);
      fetchModels();
      setConfirmDelete(null);
    } catch (err) {
      setError('删除模型失败');
      console.error('删除模型失败:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Ollama本地模型</Title>
        <Button 
          type="primary" 
          onClick={() => navigate('/ollama/create')}
          icon={<PlusOutlined />}
        >
          创建新模型
        </Button>
      </div>

      {error && (
        <Alert 
          message="错误" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 24 }}
          action={
            <Button type="primary" size="small" onClick={fetchModels}>
              重试
            </Button>
          }
        />
      )}

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {models.length > 0 ? (
            models.map((model) => (
              <Col xs={24} sm={12} md={8} lg={6} key={model.name}>
                <Card
                  title={model.name}
                  bordered={false}
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  actions={[
                    <Button 
                      type="text" 
                      icon={<MessageOutlined />} 
                      onClick={() => handleChat(model.name)}
                    >
                      聊天
                    </Button>,
                    <Button 
                      type="text" 
                      icon={<SettingOutlined />} 
                      onClick={() => handleSettings(model.name)}
                    >
                      配置
                    </Button>,
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => setConfirmDelete(model.name)}
                    >
                      删除
                    </Button>
                  ]}
                >
                  <Space direction="vertical" style={{ flex: 1 }}>
                    <Text type="secondary">ID: {model.id}</Text>
                    <Text type="secondary">大小: {model.size ? `${(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB` : '未知'}</Text>
                    <Text type="secondary">创建时间: {model.created_at ? new Date(model.created_at).toLocaleString() : '未知'}</Text>
                    {model.modified_at && (
                      <Text type="secondary">修改时间: {new Date(model.modified_at).toLocaleString()}</Text>
                    )}
                    {model.details && (
                      <div>
                        <Text strong>参数:</Text>
                        <List
                          size="small"
                          dataSource={Object.entries(model.details).slice(0, 5)}
                          renderItem={([key, value]) => (
                            <List.Item>
                              <Text type="secondary">{key}: {value}</Text>
                            </List.Item>
                          )}
                        />
                      </div>
                    )}
                    {model.tags && model.tags.length > 0 && (
                      <div>
                        <Space wrap>
                          {model.tags.map((tag) => (
                            <Tag key={tag} color="blue">{tag}</Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Card>
                <Empty 
                  description="暂无本地模型"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" onClick={() => navigate('/ollama/create')}>
                    创建第一个模型
                  </Button>
                </Empty>
              </Card>
            </Col>
          )}
        </Row>
      </Spin>

      <Modal
        title="确认删除"
        open={confirmDelete !== null}
        onOk={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        okText="删除"
        cancelText="取消"
        okType="danger"
      >
        <p>确定要删除模型 <strong>{confirmDelete}</strong> 吗？</p>
        <p style={{ color: '#ff4d4f' }}>此操作不可恢复！</p>
      </Modal>
    </div>
  );
};

export default OllamaDashboard;