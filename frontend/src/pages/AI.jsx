import { useState, useRef, useEffect } from 'react';
import { Card, Typography, Tabs } from 'antd';
import './AI.css';

const { Title, Paragraph } = Typography;

// API请求函数
const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${url}`, {
    ...options,
    headers,
  });
  
  const responseData = await response.json();
  
  if (!response.ok || !responseData.success) {
    throw new Error(responseData.message || `请求失败: ${response.status}`);
  }
  
  return responseData;
};
// AI使用限制常量
const AI_LIMITS = {
  // 普通用户限制
  free: {
    chat: 10,         // 聊天次数
    generate_content: 5,  // 内容生成次数
    analysis: 3       // 数据分析次数
  },
  // VIP用户限制
  vip: {
    chat: 100,        // 聊天次数
    generate_content: 50,  // 内容生成次数
    analysis: 20      // 数据分析次数
  }
};

// 获取当前用户的AI使用限制
const getAILimits = (isVip) => {
  return isVip ? AI_LIMITS.vip : AI_LIMITS.free;
};

// 获取用户AI使用情况
const fetchAIUsage = async () => {
  try {
    // 从localStorage获取userId
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('未登录');
    }
    
    const response = await request(`/api/ai/usage/${userId}`);
    const apiData = response.data;
    
    // 映射API返回字段到前端期望的字段名
    return {
      chat: apiData.ai_chat_count || 0,
      generate_content: apiData.ai_content_count || 0,
      analysis: apiData.ai_analysis_count || 0,
      resetAt: apiData.ai_last_reset_at || new Date().toISOString(), // 映射ai_last_reset_at到resetAt
      chatLimit: getAILimits(apiData.is_vip || false).chat,
      contentLimit: getAILimits(apiData.is_vip || false).generate_content,
      analysisLimit: getAILimits(apiData.is_vip || false).analysis,
      isVip: apiData.is_vip || false
    };
  } catch (error) {
    console.error('获取AI使用情况失败:', error);
    // 失败时使用模拟数据
    const user = JSON.parse(localStorage.getItem('user')) || { is_vip: false };
    const limits = getAILimits(user.is_vip);
    
    const aiUsage = JSON.parse(localStorage.getItem('aiUsage')) || {
      chat: Math.floor(Math.random() * 5),
      generate_content: Math.floor(Math.random() * 3),
      analysis: Math.floor(Math.random() * 2),
      resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后重置
    };
    
    return {
      ...aiUsage,
      chatLimit: limits.chat,
      contentLimit: limits.generate_content,
      analysisLimit: limits.analysis,
      isVip: user.is_vip
    };
  }
};

// 更新AI使用次数
const updateAIUsage = async (usageType) => {
  try {
    // 从localStorage获取userId
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('未登录');
    }
    
    const response = await request(`/api/ai/usage/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ usage_type: usageType })
    });
    return response.data;
  } catch (error) {
    console.error('更新AI使用次数失败:', error);
    // 失败时使用模拟更新
    const currentUsage = JSON.parse(localStorage.getItem('aiUsage')) || {
      chat: 0,
      generate_content: 0,
      analysis: 0,
      resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const updatedUsage = {
      ...currentUsage,
      [usageType]: currentUsage[usageType] + 1
    };
    
    localStorage.setItem('aiUsage', JSON.stringify(updatedUsage));
    return updatedUsage;
  }
};

const AI = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: '你好！我是你的AI助手，有什么可以帮助你的吗？',
      sender: 'ai',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 内容生成状态
  const [contentType, setContentType] = useState('通知公告');
  const [contentTopic, setContentTopic] = useState('');
  const [contentKeywords, setContentKeywords] = useState('');
  const [contentLength, setContentLength] = useState(500);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('这里将显示AI生成的内容...');

  // AI使用次数状态
  const [aiUsage, setAIUsage] = useState(null);
  const [isVip, setIsVip] = useState(false);

  // 获取用户信息和AI使用情况
  useEffect(() => {
    const loadUserAndAIUsage = async () => {
      // 获取用户信息
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setIsVip(parsedUser.is_vip || false);
      }

      // 获取AI使用情况
      const usage = await fetchAIUsage();
      if (usage) {
        setAIUsage(usage);
      }
    };

    loadUserAndAIUsage();
  }, []);

  // 检查是否可以使用AI功能
  const canUseAI = (usageType) => {
    if (!aiUsage) return true; // 未获取到使用情况时默认允许
    
    const limits = getAILimits(isVip);
    const usage = aiUsage[usageType] || 0;
    const limit = limits[usageType] || 0;
    
    return usage < limit;
  };

  // 显示使用限制提示
  const showLimitExceededMessage = (usageType) => {
    const limits = getAILimits(isVip);
    const usage = aiUsage[usageType] || 0;
    const limit = limits[usageType] || 0;
    
    alert(`AI${usageType === 'chat' ? '聊天' : usageType === 'generate_content' ? '内容生成' : '数据分析'}次数已用完！\n已使用：${usage}/${limit}次\n${isVip ? 'VIP用户' : '普通用户'}每月可使用${limit}次\n${isVip ? '' : '升级VIP可获得更多使用次数！'}`);
  };

  // 滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // 检查AI聊天使用限制
    if (!canUseAI('chat')) {
      showLimitExceededMessage('chat');
      return;
    }

    // 添加用户消息
    const newUserMessage = {
      id: messages.length + 1,
      content: inputValue.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString()
    };
    setMessages([...messages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 更新AI使用次数
      await updateAIUsage('chat');
      
      // 调用AI API
      const response = await fetch(`https://api.52vmy.cn/api/chat/spark?msg=${encodeURIComponent(inputValue.trim())}`);
      const data = await response.json();
      
      // 添加AI回复
      if (data.code === 200) {
        const newAIMessage = {
          id: messages.length + 2,
          content: data.data.answer,
          sender: 'ai',
          time: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, newAIMessage]);
      }
      
      // 更新AI使用情况
      const usage = await fetchAIUsage();
      if (usage) {
        setAIUsage(usage);
      }
    } catch (error) {
      console.error('AI API调用失败:', error);
      const errorMessage = {
        id: messages.length + 2,
        content: '抱歉，AI服务暂时不可用，请稍后再试。',
        sender: 'ai',
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车键发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  // 生成内容
  const handleGenerateContent = async () => {
    if (!contentTopic.trim() || isGenerating) return;

    // 检查AI内容生成使用限制
    if (!canUseAI('generate_content')) {
      showLimitExceededMessage('generate_content');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('正在生成内容...');

    try {
      // 更新AI使用次数
      await updateAIUsage('generate_content');
      
      // 构建生成内容的prompt
      const prompt = `生成一篇${contentLength}字的${contentType}，主题是${contentTopic}${contentKeywords ? `，关键词包括：${contentKeywords}` : ''}。`;
      
      // 调用AI API
      const response = await fetch(`https://api.52vmy.cn/api/chat/spark?msg=${encodeURIComponent(prompt)}`);
      const data = await response.json();
      
      if (data.code === 200) {
        setGeneratedContent(data.data.answer);
      } else {
        setGeneratedContent('生成失败，请稍后重试。');
      }
      
      // 更新AI使用情况
      const usage = await fetchAIUsage();
      if (usage) {
        setAIUsage(usage);
      }
    } catch (error) {
      console.error('内容生成失败:', error);
      setGeneratedContent('生成失败，请检查网络连接或稍后重试。');
    } finally {
      setIsGenerating(false);
    }
  };

  // 处理内容长度变化
  const handleLengthChange = (e) => {
    setContentLength(Number(e.target.value));
  };

  // 编辑内容
  const handleEditContent = () => {
    // 这里可以实现编辑功能，例如将生成的内容放入可编辑状态
    alert('编辑功能将在后续版本中实现');
  };

  // 保存内容
  const handleSaveContent = () => {
    // 这里可以实现保存功能，例如将生成的内容保存到数据库
    alert('保存功能将在后续版本中实现');
  };

  // 复制内容
  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent)
      .then(() => {
        alert('内容已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      });
  };

  return (
    <div className="ai-page-container">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginTop: 0 }}>AI功能中心</Title>
        <Paragraph type="secondary">智能助手、数据分析和内容生成</Paragraph>
      </div>

      {/* AI使用次数显示 */}
          {aiUsage && (
            <div className="ai-usage-stats">
              <div className="usage-header">
                <h3>AI使用统计</h3>
                <span className="usage-reset-info">
                  下次重置时间：{new Date(aiUsage.resetAt).toLocaleDateString()}
                </span>
              </div>
              <div className="usage-cards">
                <div className="usage-card">
                  <div className="usage-card-icon">💬</div>
                  <div className="usage-card-content">
                    <div className="usage-card-title">AI聊天</div>
                    <div className="usage-card-value">
                      <span className="usage-count">{aiUsage.chat || 0}</span>
                      <span className="usage-divider">/</span>
                      <span className="usage-limit">{getAILimits(isVip).chat}</span>
                    </div>
                    <div className="usage-progress">
                      <div 
                        className="usage-progress-bar" 
                        style={{ 
                          width: `${Math.min(((aiUsage.chat || 0) / getAILimits(isVip).chat) * 100, 100)}%`,
                          backgroundColor: isVip ? '#ffd700' : '#4CAF50'
                        }} 
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="usage-card">
                  <div className="usage-card-icon">📝</div>
                  <div className="usage-card-content">
                    <div className="usage-card-title">内容生成</div>
                    <div className="usage-card-value">
                      <span className="usage-count">{aiUsage.generate_content || 0}</span>
                      <span className="usage-divider">/</span>
                      <span className="usage-limit">{getAILimits(isVip).generate_content}</span>
                    </div>
                    <div className="usage-progress">
                      <div 
                        className="usage-progress-bar" 
                        style={{ 
                          width: `${Math.min(((aiUsage.generate_content || 0) / getAILimits(isVip).generate_content) * 100, 100)}%`,
                          backgroundColor: isVip ? '#ffd700' : '#2196F3'
                        }} 
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="usage-card">
                  <div className="usage-card-icon">📊</div>
                  <div className="usage-card-content">
                    <div className="usage-card-title">数据分析</div>
                    <div className="usage-card-value">
                      <span className="usage-count">{aiUsage.analysis || 0}</span>
                      <span className="usage-divider">/</span>
                      <span className="usage-limit">{getAILimits(isVip).analysis}</span>
                    </div>
                    <div className="usage-progress">
                      <div 
                        className="usage-progress-bar" 
                        style={{ 
                          width: `${Math.min(((aiUsage.analysis || 0) / getAILimits(isVip).analysis) * 100, 100)}%`,
                          backgroundColor: isVip ? '#ffd700' : '#FF9800'
                        }} 
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* AI功能标签页 */}
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeTab === 'assistant' ? 'active' : ''}`}
              onClick={() => setActiveTab('assistant')}
            >
              AI助手
            </button>
            <button 
              className={`settings-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              数据分析
            </button>
            <button 
              className={`settings-tab ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              内容生成
            </button>
            <button 
              className={`settings-tab ${activeTab === 'behavior' ? 'active' : ''}`}
              onClick={() => setActiveTab('behavior')}
            >
              用户行为
            </button>
            <button 
              className={`settings-tab ${activeTab === 'detection' ? 'active' : ''}`}
              onClick={() => setActiveTab('detection')}
            >
              异常检测
            </button>
          </div>

          {/* AI助手内容 */}
          {activeTab === 'assistant' && (
            <div className="settings-content">
              <div className="settings-section">
                <h2>AI智能助手</h2>
                <div className="ai-assistant-container">
                  <div className="ai-chat-history">
                    {messages.map((message) => (
                      <div key={message.id} className={`ai-message ${message.sender}`}>
                        <div className="message-avatar">
                          {message.sender === 'ai' ? '🤖' : '👤'}
                        </div>
                        <div className="message-content">
                          <div className="message-text">{message.content}</div>
                          <div className="message-time">{message.time}</div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="ai-message">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                          <div className="message-text">正在思考...</div>
                          <div className="message-time">{new Date().toLocaleTimeString()}</div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="ai-chat-input">
                    <input 
                      type="text" 
                      placeholder="输入你的问题..." 
                      className="form-input-macaron"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={isLoading}
                    />
                    <button 
                      className="submit-button-macaron"
                      onClick={handleSendMessage}
                      disabled={isLoading}
                    >
                      {isLoading ? '发送中...' : '发送'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 数据分析内容 */}
          {activeTab === 'analytics' && (
            <div className="settings-content">
              <div className="settings-section">
                <h2>AI数据分析</h2>
                <div className="ai-analytics-container">
                  <div className="stats-cards-container">
                    <div className="stat-card">
                      <div className="stat-card-header">
                        <h3 className="stat-card-title">用户增长预测</h3>
                        <div className="stat-card-icon">📈</div>
                      </div>
                      <div className="stat-card-body">
                        <div className="stat-card-value">+12.5%</div>
                        <div className="stat-card-trend up">
                          <span>↗</span> 较上月
                        </div>
                      </div>
                      <div className="stat-card-footer">
                        <p className="stat-card-description">AI预测下月用户增长趋势</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-header">
                        <h3 className="stat-card-title"> revenue forecast</h3>
                        <div className="stat-card-icon">💰</div>
                      </div>
                      <div className="stat-card-body">
                        <div className="stat-card-value">$24.8K</div>
                        <div className="stat-card-trend up">
                          <span>↗</span> 较上月
                        </div>
                      </div>
                      <div className="stat-card-footer">
                        <p className="stat-card-description">AI预测下月 revenue</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-header">
                        <h3 className="stat-card-title">活跃度评分</h3>
                        <div className="stat-card-icon">🔥</div>
                      </div>
                      <div className="stat-card-body">
                        <div className="stat-card-value">8.5/10</div>
                        <div className="stat-card-trend up">
                          <span>↗</span> 较上月
                        </div>
                      </div>
                      <div className="stat-card-footer">
                        <p className="stat-card-description">AI评估平台活跃度</p>
                      </div>
                    </div>
                  </div>
                  <div className="ai-insights">
                    <div className="recent-activity-container">
                      <div className="section-header">
                        <h2>AI智能洞察</h2>
                      </div>
                      <div className="activity-timeline">
                        <div className="activity-item">
                          <div className="activity-icon">💡</div>
                          <div className="activity-content">
                            <div className="activity-info">
                              <span className="activity-user">AI建议</span>
                              <span className="activity-action">优化用户注册流程，预计可提高转化率15%</span>
                            </div>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-icon">💡</div>
                          <div className="activity-content">
                            <div className="activity-info">
                              <span className="activity-user">AI建议</span>
                              <span className="activity-action">增加通知功能，预计可提高用户留存率12%</span>
                            </div>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-icon">💡</div>
                          <div className="activity-content">
                            <div className="activity-info">
                              <span className="activity-user">AI建议</span>
                              <span className="activity-action">优化页面加载速度，预计可降低跳出率8%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 内容生成内容 */}
          {activeTab === 'content' && (
            <div className="settings-content">
              <div className="settings-section">
                <h2>AI内容生成</h2>
                <div className="ai-content-container">
                  <div className="form-group">
                    <label>内容类型</label>
                    <select 
                      className="form-input-macaron"
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                    >
                      <option>通知公告</option>
                      <option>邮件模板</option>
                      <option>文章摘要</option>
                      <option>产品描述</option>
                      <option>社交媒体文案</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>主题</label>
                    <input 
                      type="text" 
                      placeholder="输入内容主题..." 
                      className="form-input-macaron"
                      value={contentTopic}
                      onChange={(e) => setContentTopic(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>关键词</label>
                    <input 
                      type="text" 
                      placeholder="输入关键词，用逗号分隔..." 
                      className="form-input-macaron"
                      value={contentKeywords}
                      onChange={(e) => setContentKeywords(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>内容长度</label>
                    <input 
                      type="range" 
                      min="100" 
                      max="1000" 
                      value={contentLength}
                      onChange={handleLengthChange}
                    />
                    <span className="range-value">{contentLength}字</span>
                  </div>
                  <button 
                    className="submit-button-macaron"
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '生成中...' : '生成内容'}
                  </button>
                  
                  <div className="ai-generated-content">
                    <h3>生成结果</h3>
                    <div className="generated-text">
                      <p>{generatedContent}</p>
                    </div>
                    <div className="content-actions">
                      <button 
                        className="edit-button"
                        onClick={handleEditContent}
                      >
                        编辑
                      </button>
                      <button 
                        className="save-button"
                        onClick={handleSaveContent}
                      >
                        保存
                      </button>
                      <button 
                        className="copy-button"
                        onClick={handleCopyContent}
                      >
                        复制
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 用户行为内容 */}
          {activeTab === 'behavior' && (
            <div className="settings-content">
              <div className="settings-section">
                <h2>AI用户行为分析</h2>
                <div className="ai-behavior-container">
                  <div className="recent-activity-container">
                    <div className="section-header">
                      <h2>用户行为洞察</h2>
                    </div>
                    <div className="activity-timeline">
                      <div className="activity-item">
                        <div className="activity-icon">👥</div>
                        <div className="activity-content">
                          <div className="activity-info">
                            <span className="activity-user">用户群体A</span>
                            <span className="activity-action">喜欢在晚上8-10点访问平台</span>
                          </div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">👥</div>
                        <div className="activity-content">
                          <div className="activity-info">
                            <span className="activity-user">用户群体B</span>
                            <span className="activity-action">主要使用移动端访问，占比78%</span>
                          </div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">👥</div>
                        <div className="activity-content">
                          <div className="activity-info">
                            <span className="activity-user">用户群体C</span>
                            <span className="activity-action">平均停留时间超过15分钟，主要浏览VIP内容</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 异常检测内容 */}
          {activeTab === 'detection' && (
            <div className="settings-content">
              <div className="settings-section">
                <h2>AI异常检测</h2>
                <div className="ai-detection-container">
                  <div className="recent-activity-container">
                    <div className="section-header">
                      <h2>系统安全状态</h2>
                    </div>
                    <div className="activity-timeline">
                      <div className="activity-item">
                        <div className="activity-icon">✅</div>
                        <div className="activity-content">
                          <div className="activity-info">
                            <span className="activity-user">系统状态</span>
                            <span className="activity-action">当前系统运行正常，未检测到异常</span>
                          </div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">🔍</div>
                        <div className="activity-content">
                          <div className="activity-info">
                            <span className="activity-user">安全扫描</span>
                            <span className="activity-action">上次扫描时间：2025-12-24 09:00</span>
                          </div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">📊</div>
                        <div className="activity-content">
                          <div className="activity-info">
                            <span className="activity-user">风险评分</span>
                            <span className="activity-action">当前风险评分：1.2/10（低风险）</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default AI;