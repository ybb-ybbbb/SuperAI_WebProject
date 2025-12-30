// Ollama API 工具函数

// 获取Ollama服务地址
const getOllamaUrl = () => {
  return localStorage.getItem('ollama_url') || 'http://localhost:11434';
};

// 基础请求函数
const request = async (endpoint, options = {}) => {
  const url = `${getOllamaUrl()}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`Ollama API 错误: ${response.status} ${response.statusText}`);
    }
    
    // 检查响应是否为空
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Ollama API 请求失败:', error);
    throw error;
  }
};

// 流式请求函数
const streamRequest = async (endpoint, options = {}, onData, onError, onComplete) => {
  const url = `${getOllamaUrl()}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`Ollama API 错误: ${response.status} ${response.statusText}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (onComplete) onComplete();
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // 处理流式数据，按行分割
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 保留不完整的行
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (onData) onData(data);
          } catch (parseError) {
            console.error('解析流式数据失败:', parseError);
            if (onError) onError(parseError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Ollama API 流式请求失败:', error);
    if (onError) onError(error);
    throw error;
  }
};

// 获取本地模型列表
export const getLocalModels = async () => {
  try {
    const response = await request('/api/tags');
    return response.models || [];
  } catch (error) {
    console.error('获取模型列表失败:', error);
    throw error;
  }
};

// 与模型聊天
export const chatWithModel = async (model, prompt, promptTemplate = '') => {
  try {
    // 如果有提示词模板，替换占位符
    const finalPrompt = promptTemplate ? promptTemplate.replace('{{question}}', prompt) : prompt;
    
    const response = await request('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model: model,
        prompt: finalPrompt,
        stream: false,
      }),
    });
    
    return response.response || '';
  } catch (error) {
    console.error('与模型聊天失败:', error);
    throw error;
  }
};

// 流式聊天
export const streamChatWithModel = async (model, prompt, promptTemplate = '', onData, onError, onComplete) => {
  try {
    // 如果有提示词模板，替换占位符
    const finalPrompt = promptTemplate ? promptTemplate.replace('{{question}}', prompt) : prompt;
    
    await streamRequest('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model: model,
        prompt: finalPrompt,
        stream: true,
      }),
    }, onData, onError, onComplete);
  } catch (error) {
    console.error('流式聊天失败:', error);
    throw error;
  }
};

// 创建新模型
export const createModel = async (modelConfig) => {
  try {
    // 构建Modelfile内容
    let modelfile = `FROM ${modelConfig.baseModel}\n`;
    
    // 添加系统提示词
    if (modelConfig.systemPrompt) {
      modelfile += `SYSTEM "${modelConfig.systemPrompt.replace(/"/g, '\"')}"\n`;
    }
    
    // 添加模板
    if (modelConfig.template) {
      modelfile += `TEMPLATE "${modelConfig.template.replace(/"/g, '\"')}"\n`;
    }
    
    // 添加参数
    if (modelConfig.parameters) {
      for (const [key, value] of Object.entries(modelConfig.parameters)) {
        modelfile += `PARAMETER ${key} ${value}\n`;
      }
    }
    
    // 添加描述
    if (modelConfig.description) {
      modelfile += `DESCRIPTION "${modelConfig.description.replace(/"/g, '\"')}"\n`;
    }
    
    const response = await request('/api/create', {
      method: 'POST',
      body: JSON.stringify({
        name: modelConfig.name,
        modelfile: modelfile,
      }),
    });
    
    return response;
  } catch (error) {
    console.error('创建模型失败:', error);
    throw error;
  }
};

// 删除模型
export const deleteModel = async (modelName) => {
  try {
    const response = await request('/api/delete', {
      method: 'DELETE',
      body: JSON.stringify({
        name: modelName,
      }),
    });
    
    return response;
  } catch (error) {
    console.error('删除模型失败:', error);
    throw error;
  }
};

// 获取模型信息
export const getModelInfo = async (modelName) => {
  try {
    const response = await request('/api/show', {
      method: 'POST',
      body: JSON.stringify({
        name: modelName,
      }),
    });
    
    return response;
  } catch (error) {
    console.error('获取模型信息失败:', error);
    throw error;
  }
};

// 拉取模型
export const pullModel = async (modelName, onProgress) => {
  try {
    await streamRequest('/api/pull', {
      method: 'POST',
      body: JSON.stringify({
        name: modelName,
        stream: true,
      }),
    }, onProgress);
  } catch (error) {
    console.error('拉取模型失败:', error);
    throw error;
  }
};

// 推送模型
export const pushModel = async (modelName, onProgress) => {
  try {
    await streamRequest('/api/push', {
      method: 'POST',
      body: JSON.stringify({
        name: modelName,
        stream: true,
      }),
    }, onProgress);
  } catch (error) {
    console.error('推送模型失败:', error);
    throw error;
  }
};

// 复制模型
export const copyModel = async (sourceModel, destinationModel) => {
  try {
    const response = await request('/api/copy', {
      method: 'POST',
      body: JSON.stringify({
        source: sourceModel,
        destination: destinationModel,
      }),
    });
    
    return response;
  } catch (error) {
    console.error('复制模型失败:', error);
    throw error;
  }
};