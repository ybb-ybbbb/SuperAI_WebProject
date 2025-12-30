import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, Spin, message, List } from 'antd';
import { PlusOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createModel } from '../utils/ollama';

const { Title, Text } = Typography;
const { TextArea } = Input;

const OllamaModelCreate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreateModel = () => {
    form.validateFields().then(values => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        // 构建模型配置
        const modelConfig = {
          name: values.modelName,
          baseModel: values.baseModel,
          parameters: values.parameters ? JSON.parse(values.parameters) : {},
          template: values.template,
          systemPrompt: values.systemPrompt,
          description: values.description
        };

        createModel(modelConfig).then(() => {
          setSuccess(true);
          message.success('模型创建成功！');
          form.resetFields();
        }).catch(err => {
          setError(`模型创建失败: ${err.message || '未知错误'}`);
          message.error('模型创建失败');
          console.error('模型创建失败:', err);
        }).finally(() => {
          setLoading(false);
        });
      } catch (parseError) {
        setError(`参数解析错误: ${parseError.message}`);
        message.error('参数格式错误，请检查JSON格式');
        setLoading(false);
      }
    }).catch(info => {
      console.error('表单验证失败:', info);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button 
          type="default" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/ollama')}
          style={{ marginRight: 16 }}
        >
          返回模型列表
        </Button>
        <Title level={2} style={{ margin: 0 }}>创建新模型</Title>
      </div>

      {success && (
        <Alert 
          message="成功" 
          description="模型创建成功！您可以返回模型列表查看或开始使用新模型。" 
          type="success" 
          showIcon 
          style={{ marginBottom: 24 }}
          action={
            <Button type="primary" onClick={() => navigate('/ollama')}>
              查看模型列表
            </Button>
          }
        />
      )}

      {error && (
        <Alert 
          message="错误" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 24 }}
        />
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            baseModel: 'llama3',
            parameters: '{}',
            template: '{{ .System }}\n\nUser: {{ .Prompt }}\nAssistant: '
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="modelName"
                label="模型名称"
                rules={[{ required: true, message: '请输入模型名称' }, { pattern: /^[a-zA-Z0-9_-]+$/, message: '模型名称只能包含字母、数字、下划线和连字符' }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="例如：my-custom-model" />
              </Form.Item>

              <Form.Item
                name="baseModel"
                label="基础模型"
                rules={[{ required: true, message: '请输入基础模型' }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="例如：llama3, mistral, gemma" />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label="模型描述"
              rules={[{ required: false, message: '请输入模型描述' }]}
            >
              <Input placeholder="简短描述您的模型" />
            </Form.Item>

            <Form.Item
              name="systemPrompt"
              label="系统提示词"
              rules={[{ required: false, message: '请输入系统提示词' }]}
            >
              <TextArea
                rows={4}
                placeholder="输入系统提示词，例如：你是一个帮助用户解答问题的助手。"
              />
            </Form.Item>

            <Form.Item
              name="template"
              label="聊天模板"
              rules={[{ required: true, message: '请输入聊天模板' }]}
            >
              <TextArea
                rows={4}
                placeholder={`输入聊天模板，例如：{{ .System }}\n\nUser: {{ .Prompt }}\nAssistant: `}
              />
              <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                提示：使用 &amp;lbrace;&amp;lbrace; .System &amp;rbrace;&amp;rbrace;、&amp;lbrace;&amp;lbrace; .Prompt &amp;rbrace;&amp;rbrace; 等占位符，具体可参考Ollama文档。
              </Text>
            </Form.Item>

            <Form.Item
              name="parameters"
              label="模型参数 (JSON格式)"
              rules={[{ required: true, message: '请输入模型参数' }]}
            >
              <TextArea
                rows={6}
                placeholder='例如：{"num_ctx": 4096, "num_thread": 8, "temperature": 0.7}'
                style={{ fontFamily: 'monospace' }}
              />
              <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                提示：输入JSON格式的模型参数，具体参数可参考Ollama文档。
              </Text>
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                <Button 
                  type="default" 
                  onClick={() => form.resetFields()}
                >
                  重置
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  onClick={handleCreateModel}
                  loading={loading}
                >
                  创建模型
                </Button>
              </div>
            </Form.Item>
          </Space>
        </Form>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>模型创建说明</Title>
        <List
          dataSource={[
            '1. 模型名称必须唯一，只能包含字母、数字、下划线和连字符',
            '2. 基础模型是您要基于其创建新模型的现有模型（例如：llama3, mistral, gemma等）',
            '3. 系统提示词用于指导模型的行为和回答风格',
            '4. 聊天模板定义了模型输入的格式，包括系统提示词和用户输入的位置',
            '5. 模型参数用于调整模型的性能和行为，如上下文长度、线程数、温度等',
            '6. 创建模型需要Ollama服务正在运行，否则会失败',
            '7. 创建模型可能需要一些时间，具体取决于基础模型的大小和您的硬件配置'
          ]}
          renderItem={(item, index) => (
            <List.Item>
              <Text>{item}</Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default OllamaModelCreate;