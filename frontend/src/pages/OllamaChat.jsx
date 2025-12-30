import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Typography, Space, Select, Spin, Alert, Modal, Form, message } from 'antd';
import { SendOutlined, ClearOutlined, SettingOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLocalModels, chatWithModel } from '../utils/ollama';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const OllamaChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [showPromptConfig, setShowPromptConfig] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentChatId, setCurrentChatId] = useState(`chat_${Date.now()}`);

  // 获取URL参数中的模型名
  const getModelFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('model') || '';
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 加载本地模型列表
  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await getLocalModels();
      setModels(data || []);
      
      // 设置默认模型
      const urlModel = getModelFromUrl();
      if (urlModel && data?.some(m => m.name === urlModel)) {
        setSelectedModel(urlModel);
      } else if (data?.length > 0) {
        setSelectedModel(data[0].name);
      }
    } catch (err) {
      message.error('获取模型列表失败');
      console.error('获取模型列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedModel) {
      message.warning('请输入消息并选择模型');
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setChatLoading(true);

    try {
      const response = await chatWithModel(selectedModel, inputValue.trim(), promptTemplate);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || '暂无响应',
        timestamp: new Date().toLocaleString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      message.error('发送消息失败');
      console.error('发送消息失败:', err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '发送消息失败，请检查Ollama服务是否运行',
        timestamp: new Date().toLocaleString(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // 清除聊天记录
  const handleClearChat = () => {
    Modal.confirm({
      title: '确认清除',
      content: '确定要清除所有聊天记录吗？',
      okText: '清除',
      cancelText: '取消',
      onOk: () => {
        setMessages([]);
        localStorage.removeItem(`ollama_chat_${currentChatId}`);
      }
    });
  };

  // 保存提示词配置
  const handleSavePrompt = () => {
    form.validateFields().then(values => {
      setPromptTemplate(values.promptTemplate);
      localStorage.setItem('ollama_prompt_template', values.promptTemplate);
      message.success('提示词配置已保存');
      setShowPromptConfig(false);
    }).catch(info => {
      console.error('表单验证失败:', info);
    });
  };

  // 从localStorage加载聊天记录
  useEffect(() => {
    const loadChatHistory = () => {
      // 尝试从URL获取聊天ID或使用当前ID
      const url = new URL(window.location.href);
      const chatId = url.searchParams.get('chatId') || currentChatId;
      setCurrentChatId(chatId);
      
      // 加载聊天记录
      const savedMessages = localStorage.getItem(`ollama_chat_${chatId}`);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.error('解析聊天记录失败:', error);
          setMessages([]);
        }
      }
    };
    
    loadChatHistory();
    
    // 加载提示词配置
    const savedPrompt = localStorage.getItem('ollama_prompt_template');
    if (savedPrompt) {
      setPromptTemplate(savedPrompt);
      form.setFieldsValue({ promptTemplate: savedPrompt });
    }
  }, [form, currentChatId]);
  
  // 保存聊天记录到localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`ollama_chat_${currentChatId}`, JSON.stringify(messages));
    }
  }, [messages, currentChatId]);
  
  // 当URL参数变化时重新加载聊天记录
  useEffect(() => {
    const url = new URL(window.location.href);
    const chatId = url.searchParams.get('chatId');
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
    }
  }, [location.search]);

  return (
    <div>
      <Title level={2}>Ollama聊天</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Text strong>选择模型:</Text>
              <Spin spinning={loading}>
                <Select
                  value={selectedModel}
                  onChange={setSelectedModel}
                  style={{ width: 300 }}
                  placeholder="请选择模型"
                >
                  {models.map(model => (
                    <Option key={model.name} value={model.name}>
                      {model.name}
                    </Option>
                  ))}
                </Select>
              </Spin>
            </Space>
            
            <Space>
              <Button 
                type="default" 
                icon={<SettingOutlined />}
                onClick={() => setShowPromptConfig(true)}
              >
                配置提示词
              </Button>
              <Button 
                danger 
                icon={<ClearOutlined />}
                onClick={handleClearChat}
              >
                清除聊天记录
              </Button>
            </Space>
          </div>
          
          {promptTemplate && (
            <Alert 
              message="当前使用提示词模板" 
              description={promptTemplate} 
              type="info" 
              showIcon 
              style={{ margin: '16px 0 0 0' }}
              action={
                <Button size="small" onClick={() => setShowPromptConfig(true)}>
                  修改
                </Button>
              }
            />
          )}
        </Space>
      </Card>

      <Card style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#fafafa' }}>
          {messages.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              color: '#999',
              fontSize: '16px'
            }}>
              <Text>开始与AI聊天吧...</Text>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map(item => (
                <div 
                  key={item.id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: '10px'
                  }}
                >
                  {/* AI消息：图标在左，消息在右 */}
                  {item.role === 'assistant' && (
                    <RobotOutlined style={{ 
                      fontSize: 24, 
                      color: '#1677ff',
                      marginTop: '8px',
                      flexShrink: 0
                    }} />
                  )}
                  
                  <div style={{ 
                    maxWidth: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ 
                      backgroundColor: item.role === 'user' ? '#1677ff' : '#ffffff',
                      color: item.role === 'user' ? '#fff' : '#333',
                      padding: '12px 16px',
                      borderRadius: item.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      wordWrap: 'break-word',
                      lineHeight: '1.6',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      textAlign: item.role === 'user' ? 'right' : 'left'
                    }}>
                      {item.role === 'assistant' ? (
                        <div dangerouslySetInnerHTML={{ 
                          __html: item.content
                            // 先处理代码块，避免后续转换影响
                            .replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, '<pre style="background-color: #f6f8fa; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace; font-size: 13px; line-height: 1.5; color: #24292e; border: 1px solid #e1e4e8;"><code>$2</code></pre>')
                            // 处理**(动作描述)**格式，转换为斜体灰色文本
                            .replace(/\*\*(\([^)]+\))\*\*/g, '<span style="color: #999; font-style: italic; margin: 0 4px;">$1</span>')
                            // 处理**粗体**格式，支持普通粗体
                            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                            // 处理行内代码
                            .replace(/`([^`]+)`/g, '<code style="background-color: #f6f8fa; padding: 2px 6px; border-radius: 4px; font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace; font-size: 13px; color: #d73a49; border: 1px solid #e1e4e8;">$1</code>')
                            // 处理换行（不在pre标签内的）
                            .replace(/(?<!<pre[^>]*>.*?|.*?<\/pre>)\n/g, '<br />')
                        }} />
                      ) : (
                        <Text>{item.content}</Text>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#999',
                      textAlign: item.role === 'user' ? 'right' : 'left',
                      padding: '0 4px'
                    }}>
                      {item.timestamp}
                    </div>
                  </div>
                  
                  {/* 用户消息：图标在右，消息在左 */}
                  {item.role === 'user' && (
                    <UserOutlined style={{ 
                      fontSize: 24, 
                      color: '#52c41a',
                      marginTop: '8px',
                      flexShrink: 0
                    }} />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fff'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入消息..."
              autoSize={{ minRows: 2, maxRows: 6 }}
              style={{ 
                flex: 1, 
                borderRadius: '12px',
                resize: 'none',
                border: '1px solid #d9d9d9',
                fontSize: '14px'
              }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={chatLoading}
              disabled={!inputValue.trim() || !selectedModel}
              size="large"
              style={{ 
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            />
          </div>
        </div>
      </Card>

      {/* 提示词配置弹窗 */}
      <Modal
        title="提示词配置"
        open={showPromptConfig}
        onOk={handleSavePrompt}
        onCancel={() => setShowPromptConfig(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          initialValues={{ promptTemplate }}
        >
          <Form.Item
            name="promptTemplate"
            label="提示词模板"
            rules={[{ required: false, message: '请输入提示词模板' }]}
          >
            <TextArea
              rows={6}
              placeholder={`输入提示词模板，例如：你是一个助手，请回答用户的问题。\n\n用户：{{question}}\n助手：`}
            />
          </Form.Item>
          <Form.Item>
            <Text type="secondary">
              提示：使用 {'{{question}}'} 作为用户输入的占位符，模板将在发送消息时自动替换。
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OllamaChat;