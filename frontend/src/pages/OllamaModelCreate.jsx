import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, Spin, message, List, Slider, Select } from 'antd';
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
        // 构建模型参数
        const parameters = {
          temperature: values.temperature || 0.7,
          top_p: values.topP || 0.9,
          num_ctx: values.num_ctx || 4096,
          num_thread: values.num_thread || 8,
          num_gpu: values.num_gpu || 0,
          repeat_penalty: values.repeat_penalty || 1.1,
          // 合并自定义参数
          ...(values.parametersJson ? JSON.parse(values.parametersJson) : {})
        };

        // 构建模型配置
        const modelConfig = {
          name: values.modelName,
          baseModel: values.baseModel,
          parameters: parameters,
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
        message.error('自定义参数格式错误，请检查JSON格式');
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
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
                  模板示例：
                </Text>
                <pre style={{ backgroundColor: '#f6f8fa', padding: '8px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace', margin: '0 0 16px 0' }}>
&amp;lbrace;&amp;lbrace; .System &amp;rbrace;&amp;rbrace;

User: &amp;lbrace;&amp;lbrace; .Prompt &amp;rbrace;&amp;rbrace;
Assistant: 
                </pre>
              </div>
              <TextArea
                rows={6}
                placeholder={`输入聊天模板，使用以下占位符：\n- {{ .System }}：系统提示词\n- {{ .Prompt }}：用户输入\n- {{ .Response }}：模型响应（可选）`}
                style={{ fontFamily: 'monospace' }}
              />
              <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>可用占位符说明：</Text>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li style={{ marginBottom: 4 }}>
                    <Text code style={{ backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>&amp;lbrace;&amp;lbrace; .System &amp;rbrace;&amp;rbrace;</Text> - 插入系统提示词
                  </li>
                  <li style={{ marginBottom: 4 }}>
                    <Text code style={{ backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>&amp;lbrace;&amp;lbrace; .Prompt &amp;rbrace;&amp;rbrace;</Text> - 插入用户输入内容
                  </li>
                  <li style={{ marginBottom: 4 }}>
                    <Text code style={{ backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>&amp;lbrace;&amp;lbrace; .Response &amp;rbrace;&amp;rbrace;</Text> - 插入模型响应（通常用于自定义输出格式）
                  </li>
                </ul>
              </div>
            </Form.Item>

            <div>
              <Title level={5} style={{ margin: '16px 0 8px 0' }}>模型参数</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="temperature"
                  label="温度 (Temperature)"
                  initialValue={0.7}
                >
                  <div>
                    <Slider 
                      min={0} 
                      max={2} 
                      step={0.1} 
                      value={form.getFieldValue('temperature') || 0.7} 
                      onChange={(value) => form.setFieldsValue({ temperature: value })} 
                    />
                    <Text type="secondary" style={{ marginLeft: 16 }}>
                      当前值: {form.getFieldValue('temperature') || 0.7}
                    </Text>
                  </div>
                </Form.Item>

                <Form.Item
                  name="topP"
                  label="Top P"
                  initialValue={0.9}
                >
                  <div>
                    <Slider 
                      min={0} 
                      max={1} 
                      step={0.05} 
                      value={form.getFieldValue('topP') || 0.9} 
                      onChange={(value) => form.setFieldsValue({ topP: value })} 
                    />
                    <Text type="secondary" style={{ marginLeft: 16 }}>
                      当前值: {form.getFieldValue('topP') || 0.9}
                    </Text>
                  </div>
                </Form.Item>

                <Form.Item
                  name="num_ctx"
                  label="上下文长度 (Context Length)"
                  initialValue={4096}
                >
                  <Select
                    value={form.getFieldValue('num_ctx') || 4096}
                    onChange={(value) => form.setFieldsValue({ num_ctx: value })}
                  >
                    <Select.Option value={1024}>1024</Select.Option>
                    <Select.Option value={2048}>2048</Select.Option>
                    <Select.Option value={4096}>4096</Select.Option>
                    <Select.Option value={8192}>8192</Select.Option>
                    <Select.Option value={16384}>16384</Select.Option>
                    <Select.Option value={32768}>32768</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="num_thread"
                  label="线程数 (Threads)"
                  initialValue={8}
                >
                  <Select
                    value={form.getFieldValue('num_thread') || 8}
                    onChange={(value) => form.setFieldsValue({ num_thread: value })}
                  >
                    <Select.Option value={1}>1</Select.Option>
                    <Select.Option value={4}>4</Select.Option>
                    <Select.Option value={8}>8</Select.Option>
                    <Select.Option value={16}>16</Select.Option>
                    <Select.Option value={32}>32</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="num_gpu"
                  label="GPU数量 (GPU Count)"
                  initialValue={0}
                >
                  <Select
                    value={form.getFieldValue('num_gpu') || 0}
                    onChange={(value) => form.setFieldsValue({ num_gpu: value })}
                  >
                    <Select.Option value={0}>0 (仅CPU)</Select.Option>
                    <Select.Option value={1}>1</Select.Option>
                    <Select.Option value={2}>2</Select.Option>
                    <Select.Option value={-1}>全部可用GPU</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="repeat_penalty"
                  label="重复惩罚 (Repeat Penalty)"
                  initialValue={1.1}
                >
                  <div>
                    <Slider 
                      min={0.8} 
                      max={2} 
                      step={0.1} 
                      value={form.getFieldValue('repeat_penalty') || 1.1} 
                      onChange={(value) => form.setFieldsValue({ repeat_penalty: value })} 
                    />
                    <Text type="secondary" style={{ marginLeft: 16 }}>
                      当前值: {form.getFieldValue('repeat_penalty') || 1.1}
                    </Text>
                  </div>
                </Form.Item>

                <Form.Item
                  name="parametersJson"
                  label="自定义参数 (JSON格式)"
                  initialValue="{}"
                  rules={[{ required: false, message: '请输入有效的JSON格式' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder='例如：{"stop": ["\nUser:", "\nAssistant:"]}'
                    style={{ fontFamily: 'monospace' }}
                  />
                  <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                    提示：输入其他自定义参数，使用JSON格式。
                  </Text>
                </Form.Item>
              </Space>
            </div>

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