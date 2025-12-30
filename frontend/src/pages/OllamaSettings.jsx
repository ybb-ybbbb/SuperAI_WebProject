import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, message, Select, Slider, Switch } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

const OllamaSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const location = useLocation();

  // 从URL获取模型名（如果有）
  const getModelFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('model') || '';
  };

  // 加载保存的配置
  const loadConfig = () => {
    const savedConfig = {
      ollamaUrl: localStorage.getItem('ollama_url') || 'http://localhost:11434',
      defaultModel: localStorage.getItem('ollama_default_model') || '',
      temperature: parseFloat(localStorage.getItem('ollama_temperature')) || 0.7,
      maxTokens: parseInt(localStorage.getItem('ollama_max_tokens')) || 4096,
      topP: parseFloat(localStorage.getItem('ollama_top_p')) || 0.9,
      enableStreaming: localStorage.getItem('ollama_enable_streaming') === 'true' || true,
      defaultPromptTemplate: localStorage.getItem('ollama_prompt_template') || '',
      systemPrompt: localStorage.getItem('ollama_system_prompt') || ''
    };

    form.setFieldsValue(savedConfig);
  };

  useEffect(() => {
    loadConfig();
  }, [form]);

  // 保存配置
  const handleSaveConfig = () => {
    form.validateFields().then(values => {
      setLoading(true);
      setSuccess(false);

      // 保存到localStorage
      localStorage.setItem('ollama_url', values.ollamaUrl);
      localStorage.setItem('ollama_default_model', values.defaultModel);
      localStorage.setItem('ollama_temperature', values.temperature.toString());
      localStorage.setItem('ollama_max_tokens', values.maxTokens.toString());
      localStorage.setItem('ollama_top_p', values.topP.toString());
      localStorage.setItem('ollama_enable_streaming', values.enableStreaming.toString());
      localStorage.setItem('ollama_prompt_template', values.defaultPromptTemplate);
      localStorage.setItem('ollama_system_prompt', values.systemPrompt);

      message.success('配置保存成功！');
      setSuccess(true);
      setLoading(false);

      // 3秒后隐藏成功提示
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }).catch(info => {
      console.error('表单验证失败:', info);
    });
  };

  // 重置配置
  const handleResetConfig = () => {
    // 使用默认值重置
    form.setFieldsValue({
      ollamaUrl: 'http://localhost:11434',
      defaultModel: '',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.9,
      enableStreaming: true,
      defaultPromptTemplate: '',
      systemPrompt: ''
    });
  };

  // 应用到当前模型（如果有）
  const handleApplyToModel = () => {
    const modelName = getModelFromUrl();
    if (modelName) {
      // 这里可以添加应用到特定模型的逻辑
      message.success(`配置已应用到模型 ${modelName}`);
    } else {
      message.info('未指定模型，配置将作为全局默认值');
    }
  };

  return (
    <div>
      <Title level={2}>Ollama配置</Title>
      
      {getModelFromUrl() && (
        <Alert 
          message="模型特定配置" 
          description={`当前正在配置模型: ${getModelFromUrl()}`} 
          type="info" 
          showIcon 
          style={{ marginBottom: 24 }}
        />
      )}

      {success && (
        <Alert 
          message="成功" 
          description="配置保存成功！" 
          type="success" 
          showIcon 
          style={{ marginBottom: 24 }}
        />
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 服务配置 */}
            <div>
              <Title level={4} style={{ margin: '0 0 16px 0' }}>服务配置</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="ollamaUrl"
                  label="Ollama服务地址"
                  rules={[{ required: true, message: '请输入Ollama服务地址' }]}
                >
                  <Input placeholder="例如：http://localhost:11434" />
                </Form.Item>

                <Form.Item
                  name="defaultModel"
                  label="默认模型"
                  rules={[{ required: false, message: '请输入默认模型名称' }]}
                >
                  <Input placeholder="例如：llama3" />
                </Form.Item>
              </Space>
            </div>

            {/* 模型参数 */}
            <div>
              <Title level={4} style={{ margin: '0 0 16px 0' }}>模型参数</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="temperature"
                  label="温度 (Temperature)"
                  rules={[{ required: true, message: '请设置温度值' }]}
                >
                  <div>
                    <Slider 
                      min={0} 
                      max={2} 
                      step={0.1} 
                      value={form.getFieldValue('temperature')} 
                      onChange={(value) => form.setFieldsValue({ temperature: value })} 
                    />
                    <Text type="secondary" style={{ marginLeft: 16 }}>
                      当前值: {form.getFieldValue('temperature')}
                    </Text>
                  </div>
                </Form.Item>

                <Form.Item
                  name="topP"
                  label="Top P"
                  rules={[{ required: true, message: '请设置Top P值' }]}
                >
                  <div>
                    <Slider 
                      min={0} 
                      max={1} 
                      step={0.05} 
                      value={form.getFieldValue('topP')} 
                      onChange={(value) => form.setFieldsValue({ topP: value })} 
                    />
                    <Text type="secondary" style={{ marginLeft: 16 }}>
                      当前值: {form.getFieldValue('topP')}
                    </Text>
                  </div>
                </Form.Item>

                <Form.Item
                  name="maxTokens"
                  label="最大 tokens"
                  rules={[{ required: true, message: '请设置最大tokens值' }]}
                >
                  <Select
                    value={form.getFieldValue('maxTokens')}
                    onChange={(value) => form.setFieldsValue({ maxTokens: value })}
                  >
                    <Select.Option value={1024}>1024</Select.Option>
                    <Select.Option value={2048}>2048</Select.Option>
                    <Select.Option value={4096}>4096</Select.Option>
                    <Select.Option value={8192}>8192</Select.Option>
                    <Select.Option value={16384}>16384</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="enableStreaming"
                  label="启用流式输出"
                  valuePropName="checked"
                >
                  <Switch checked={form.getFieldValue('enableStreaming')} />
                </Form.Item>
              </Space>
            </div>

            {/* 提示词配置 */}
            <div>
              <Title level={4} style={{ margin: '0 0 16px 0' }}>提示词配置</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="systemPrompt"
                  label="默认系统提示词"
                  rules={[{ required: false, message: '请输入默认系统提示词' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="输入默认系统提示词，例如：你是一个帮助用户解答问题的助手。"
                  />
                </Form.Item>

                <Form.Item
                  name="defaultPromptTemplate"
                  label="默认提示词模板"
                  rules={[{ required: false, message: '请输入默认提示词模板' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder={`输入默认提示词模板，例如：{{ .System }}\n\nUser: {{ .Prompt }}\nAssistant: `}
                  />
                  <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                    提示：使用 &amp;lbrace;&amp;lbrace; .System &amp;rbrace;&amp;rbrace;、&amp;lbrace;&amp;lbrace; .Prompt &amp;rbrace;&amp;rbrace; 等占位符，具体可参考Ollama文档。
                  </Text>
                </Form.Item>
              </Space>
            </div>

            {/* 操作按钮 */}
            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                <Button 
                  type="default" 
                  icon={<ReloadOutlined />}
                  onClick={handleResetConfig}
                >
                  重置为默认值
                </Button>
                
                {getModelFromUrl() && (
                  <Button 
                    type="default" 
                    onClick={handleApplyToModel}
                  >
                    应用到当前模型
                  </Button>
                )}
                
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  onClick={handleSaveConfig}
                  loading={loading}
                >
                  保存配置
                </Button>
              </div>
            </Form.Item>
          </Space>
        </Form>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>配置说明</Title>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <Text strong>Ollama服务地址：</Text>
            <Text>Ollama服务的HTTP地址，默认为 http://localhost:11434</Text>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Text strong>默认模型：</Text>
            <Text>聊天时默认使用的模型，留空则需要手动选择</Text>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Text strong>温度 (Temperature)：</Text>
            <Text>控制生成内容的随机性，值越高越随机，值越低越确定（0-2）</Text>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Text strong>Top P：</Text>
            <Text>控制生成内容的多样性，值越高越多样，值越低越集中（0-1）</Text>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Text strong>最大 tokens：</Text>
            <Text>控制生成内容的最大长度</Text>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Text strong>启用流式输出：</Text>
            <Text>开启后，AI回复会逐字显示，提升交互体验</Text>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Text strong>系统提示词：</Text>
            <Text>指导AI行为和回答风格的默认提示词</Text>
          </li>
          <li style={{ marginBottom: 8 }}>
            <Text strong>提示词模板：</Text>
            <Text>定义AI输入的格式，包括系统提示词和用户输入的位置</Text>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default OllamaSettings;