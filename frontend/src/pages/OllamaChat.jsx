import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Typography, Space, Select, Spin, Alert, Modal, Form, message } from 'antd';
import { SendOutlined, ClearOutlined, SettingOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLocalModels, chatWithModel, streamChatWithModel } from '../utils/ollama';

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
  const chatContainerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 获取URL参数中的模型名
  const getModelFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('model') || '';
  };

  // 滚动到底部
  const scrollToBottom = () => {
    // 使用 scrollTop 替代 scrollIntoView，避免触发外层页面滚动
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
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
    
    // 初始化时加载单会话记录
    const savedMessages = localStorage.getItem('ollama_current_session');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('解析聊天记录失败:', error);
        setMessages([]);
      }
    } else {
        // 尝试迁移旧的最后一次聊天记录（如果存在）
        const lastChatId = localStorage.getItem('ollama_last_chat_id');
        if (lastChatId) {
            const oldMessages = localStorage.getItem(`ollama_chat_${lastChatId}`);
            if (oldMessages) {
                try {
                    setMessages(JSON.parse(oldMessages));
                } catch (e) {
                    setMessages([]);
                }
            }
        }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 保存聊天记录到localStorage (单会话模式)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ollama_current_session', JSON.stringify(messages));
    } else {
        // 如果消息为空，也可以选择清除或者保留空数组
        // 这里选择保留空数组逻辑，或者如果真的被清除了，就删掉 key
        // 但为了防止刷新丢失，还是同步状态比较好。
        // 特例：如果是初始加载导致的空，不应该覆盖。但我们有初始加载逻辑。
        // 简单起见，始终同步。
        // 为了避免初始空状态覆盖已有数据，我们需要确保初始加载完成后才开启保存。
        // 但 React Effect 依赖会导致初始也执行。
        // 实际上，初始加载是在 Mount Effect，这个 Effect 也是 Mount 后执行。
        // 如果 Mount 时 load 了数据，setMessages 会触发重渲染，然后这个 Effect 执行，保存（此时数据一致）。
        // 如果 Mount 时没数据，messages 是 []，保存 []。
        // 唯一风险：localStorage 有数据，但 load 失败变成 []，然后保存 [] 覆盖了。
        // 但我们在 load catch 里设了 []，说明数据坏了，覆盖也没事。
    }
  }, [messages]);
  
  // 优化：当 messages 变为空时（例如清空），也更新 localStorage
  const saveSession = (msgs) => {
      localStorage.setItem('ollama_current_session', JSON.stringify(msgs));
  };

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

    // 预先创建一个空的AI回复消息
    const assistantMessageId = (Date.now() + 1).toString();
    const initialAssistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '', // 初始为空
      timestamp: new Date().toLocaleString(),
      isStreaming: true // 标记正在流式传输
    };

    const newMessages = [...messages, userMessage, initialAssistantMessage];
    setMessages(newMessages);
    // 此时不立即保存到 localStorage，等流传输完成后再保存，避免保存了中间状态
    // 但为了防止刷新丢失用户消息，可以选择只保存用户消息，或者就暂不保存。
    // 考虑到单会话模式，暂不保存最新的这条空消息也可以，或者保存了也无所谓，下次加载会是空的。
    // 为了体验更好，先保存一下，这样刷新后至少能看到用户自己的提问。
    saveSession(newMessages);

    setInputValue('');
    setChatLoading(true);

    try {
      let fullResponse = '';
      
      await streamChatWithModel(
        selectedModel, 
        userMessage.content, 
        promptTemplate,
        (data) => {
          // onData 回调：接收流式数据 chunk
          if (data.response) {
            fullResponse += data.response;
            
            setMessages(prev => {
              const updated = prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: fullResponse } 
                  : msg
              );
              return updated;
            });
          }
        },
        (error) => {
          // onError 回调
          console.error('流式聊天出错:', error);
          message.error('流式响应出错');
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse + '\n[出错: 连接中断]', isStreaming: false, error: true } 
                : msg
            );
            saveSession(updated);
            return updated;
          });
        },
        () => {
          // onComplete 回调
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, isStreaming: false } 
                : msg
            );
            saveSession(updated); // 完成后保存完整会话
            return updated;
          });
          setChatLoading(false);
        }
      );
    } catch (err) {
      // 这里的 catch 主要是捕获 streamChatWithModel 函数本身的同步错误（如请求发起失败）
      // 异步流过程中的错误由 onError 回调处理
      console.error('发送消息失败:', err);
      message.error('发送消息失败');
      
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: '发送消息失败，请检查Ollama服务是否运行', error: true, isStreaming: false } 
            : msg
        );
        saveSession(updated);
        return updated;
      });
      setChatLoading(false);
    }
  };

  // 清除聊天记录 (重置会话)
  const handleClearChat = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空当前对话吗？此操作不可恢复。',
      okText: '清空',
      cancelText: '取消',
      onOk: () => {
        setMessages([]);
        localStorage.removeItem('ollama_current_session');
      }
    });
  };

  // 保存提示词配置
  const handleSavePrompt = () => {
    form.validateFields().then(values => {
      setPromptTemplate(values.promptTemplate);
      
      if (selectedModel) {
        // 按模型保存配置
        localStorage.setItem(`ollama_prompt_template_${selectedModel}`, values.promptTemplate);
        message.success(`模型 ${selectedModel} 的提示词配置已保存`);
      } else {
        // 保存为全局配置
        localStorage.setItem('ollama_prompt_template', values.promptTemplate);
        message.success('全局提示词配置已保存');
      }
      
      setShowPromptConfig(false);
    }).catch(info => {
      console.error('表单验证失败:', info);
    });
  };

  // 按模型加载提示词配置
  useEffect(() => {
    if (selectedModel) {
      // 先尝试加载模型特定的提示词配置
      const modelPrompt = localStorage.getItem(`ollama_prompt_template_${selectedModel}`);
      if (modelPrompt) {
        setPromptTemplate(modelPrompt);
      } else {
        // 如果模型没有特定配置，加载全局默认配置
        const globalPrompt = localStorage.getItem('ollama_prompt_template');
        if (globalPrompt) {
          setPromptTemplate(globalPrompt);
        } else {
          // 如果都没有，使用空配置
          setPromptTemplate('');
        }
      }
    }
  }, [selectedModel]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Ollama聊天</Title>
        <Space>
          <Button 
            type="primary" 
            danger
            icon={<ClearOutlined />}
            onClick={handleClearChat}
          >
            清空对话
          </Button>
        </Space>
      </div>
      
      <div style={{ display: 'flex', gap: 16 }}>
        {/* 主要聊天区域 */}
        <div style={{ flex: 1 }}>
          <Card style={{ marginBottom: 16 }}>
            <Space orientation="vertical" style={{ width: '100%' }}>
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

          <Card 
            style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' } }}
          >
            <div 
              ref={chatContainerRef}
              style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#fafafa', minHeight: 0 }}
            >
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
                        alignItems: item.role === 'user' ? 'flex-end' : 'flex-start',
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
                        alignItems: item.role === 'user' ? 'flex-end' : 'flex-start',
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
                          textAlign: 'left' // 统一左对齐，用户消息也不要强制右对齐文本，因为那是英语习惯，中文习惯还是左对齐阅读
                        }}>
                          {item.role === 'assistant' ? (
                            <>
                              <div dangerouslySetInnerHTML={{ 
                                __html: (item.content || '') // 确保 content 不为 null/undefined
                                  // 先处理代码块，避免后续转换影响
                                  .replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, '<pre style="background-color: #f6f8fa; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace; font-size: 13px; line-height: 1.5; color: #24292e; border: 1px solid #e1e4e8;"><code>$2</code></pre>')
                                  // 处理**(动作描述)**格式，转换为斜体灰色文本
                                  .replace(/\*\*\(([^)]+)\)\*\*/g, '<span style="color: #999; font-style: italic; margin: 0 4px;">$1</span>')
                                  // 处理**粗体**格式，支持普通粗体
                                  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                                  // 处理行内代码
                                  .replace(/`([^`]+)`/g, '<code style="background-color: #f6f8fa; padding: 2px 6px; border-radius: 4px; font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace; font-size: 13px; color: #d73a49; border: 1px solid #e1e4e8;">$1</code>')
                                  // 处理换行（不在pre标签内的）
                                  .replace(/(?<!<pre[^>]*>.*?|.*?<\/pre>)\n/g, '<br />')
                              }} />
                              {item.isStreaming && (
                                <span style={{
                                  display: 'inline-block',
                                  width: '8px',
                                  height: '15px',
                                  backgroundColor: '#1677ff',
                                  marginLeft: '4px',
                                  verticalAlign: 'middle',
                                  animation: 'blink 1s infinite'
                                }} />
                              )}
                              {/* 添加光标闪烁动画样式 */}
                              <style>{`
                                @keyframes blink {
                                  0%, 100% { opacity: 1; }
                                  50% { opacity: 0; }
                                }
                              `}</style>
                            </>
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
              flexShrink: 0,
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
        </div>
      </div>

      {/* 提示词配置弹窗 */}
      <Modal
        title="提示词配置"
        open={showPromptConfig}
        onOk={handleSavePrompt}
        onCancel={() => setShowPromptConfig(false)}
        okText="保存"
        cancelText="取消"
        width={600}
        destroyOnHidden
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
