import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../utils/api';

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

  // 滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="content-area">
          <div className="page-header">
            <h1 className="page-title">AI功能中心</h1>
            <p className="page-description">智能助手、数据分析和内容生成</p>
          </div>
          
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
                      onKeyPress={handleKeyPress}
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
                    <select className="form-input-macaron">
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
                    />
                  </div>
                  <div className="form-group">
                    <label>关键词</label>
                    <input 
                      type="text" 
                      placeholder="输入关键词，用逗号分隔..." 
                      className="form-input-macaron"
                    />
                  </div>
                  <div className="form-group">
                    <label>内容长度</label>
                    <input 
                      type="range" 
                      min="100" 
                      max="1000" 
                      defaultValue="500" 
                    />
                    <span className="range-value">500字</span>
                  </div>
                  <button className="submit-button-macaron">生成内容</button>
                  
                  <div className="ai-generated-content">
                    <h3>生成结果</h3>
                    <div className="generated-text">
                      <p>这里将显示AI生成的内容...</p>
                    </div>
                    <div className="content-actions">
                      <button className="edit-button">编辑</button>
                      <button className="save-button">保存</button>
                      <button className="copy-button">复制</button>
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
      </div>
    </div>
  );
};

export default AI;