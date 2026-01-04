# Ollama 模块实现提示词指南

本文件记录了实现前端 Ollama 模块（包括模型管理、聊天、设置等）的 AI 提示词。通过这些提示词，可以快速重建或维护相关功能。

## 1. 聊天模块 (Chat Module)

### 功能描述
实现一个基于 React 和 Ant Design 的流式聊天界面，支持 Ollama 本地模型。核心特性包括：
- 实时流式响应（Typewriter Effect）。
- 单会话模式（自动保存当前对话到 localStorage，刷新不丢失）。
- 自动滚动到底部。
- 支持 Markdown 渲染（代码高亮）。
- 提示词配置（System Prompt）。
- 响应式布局（Flexbox）。

### 实现提示词 (Prompt)
```markdown
请创建一个 React 组件 `OllamaChat.jsx`，实现以下功能：

1.  **UI 布局**：
    -   使用 Ant Design 的 Card 和 Layout 组件。
    -   顶部显示标题和“清空对话”按钮。
    -   主体区域分为左右两部分（或上下）：左侧/顶部选择模型，右侧/下方是聊天区域。
    -   聊天区域高度自适应（`calc(100vh - 180px)`），内部消息列表可滚动，底部输入框固定。
    -   使用 Flexbox 布局确保输入框不会被消息挤出视口。

2.  **状态管理**：
    -   `messages`: 存储消息列表（数组）。
    -   `selectedModel`: 当前选中的 Ollama 模型。
    -   `inputValue`: 输入框内容。
    -   `loading/chatLoading`: 加载状态。

3.  **核心逻辑**：
    -   **模型加载**：组件挂载时调用 `getLocalModels` 获取模型列表。
    -   **单会话持久化**：
        -   使用 `localStorage.getItem('ollama_current_session')` 初始化消息。
        -   当 `messages` 变化时，自动同步到 localStorage。
        -   不使用多会话 ID，简化为单一会话。
    -   **发送消息**：
        -   用户输入后，立即将用户消息加入列表。
        -   预先插入一个空的 AI 消息（带 `isStreaming: true` 标记）。
        -   调用 `streamChatWithModel` 接口（流式）。
        -   **流式处理**：在 `onData` 回调中，不断追加 chunk 到 AI 消息的 content 中，并更新 state。
        -   **错误处理**：如果流断开或出错，更新消息状态显示错误信息。
        -   **完成处理**：流结束时，将 `isStreaming` 设为 false。

4.  **渲染细节**：
    -   **消息气泡**：
        -   用户消息靠右，AI 消息靠左。
        -   使用 `dangerouslySetInnerHTML` 渲染 Markdown 内容（需处理代码块样式）。
        -   **光标动画**：当 `isStreaming` 为 true 时，在内容末尾显示一个闪烁的光标（CSS animation）。
    -   **自动滚动**：
        -   使用 `useRef` 获取聊天容器 DOM。
        -   每当 `messages` 更新时，设置 `scrollTop = scrollHeight`。

5.  **样式修正**：
    -   确保消息气泡的 wrapper 使用 `align-items: flex-end` (用户) 或 `flex-start` (AI)，防止气泡被时间戳撑大导致对齐异常。
    -   文本内容统一左对齐（`textAlign: 'left'`），增强阅读体验。
```

## 2. 仪表盘模块 (Dashboard Module)

### 功能描述
展示本地已安装的 Ollama 模型列表，支持查看详情、快速跳转聊天、删除模型。

### 实现提示词 (Prompt)
```markdown
请创建一个 React 组件 `OllamaDashboard.jsx`，实现以下功能：

1.  **数据获取**：
    -   调用 `getLocalModels` API 获取模型列表。
    -   展示 Loading 状态和 Error 状态（支持重试）。

2.  **UI 展示**：
    -   使用 `Row/Col` 响应式网格布局展示模型卡片（Card）。
    -   卡片内容：
        -   标题：模型名称。
        -   详情：大小（GB/MB）、创建时间、修改时间。
        -   标签：显示模型的 Tags。
        -   参数列表（可选）：显示部分关键参数。

3.  **交互操作**：
    -   **聊天**：点击跳转到 `/ollama/chat?model={modelName}`。
    -   **配置**：点击跳转到 `/ollama/settings`。
    -   **删除**：点击弹出 Modal 确认框，确认后调用 `deleteModel` API，成功后刷新列表。
    -   **创建**：顶部提供“创建新模型”按钮，跳转到创建页面。

4.  **空状态**：
    -   如果列表为空，显示 `Empty` 组件引导用户创建模型。
```

## 3. 工具库 (Utils)

### 功能描述
封装 Ollama API 的 HTTP 请求，支持普通请求和流式请求。

### 实现提示词 (Prompt)
```markdown
请创建一个工具文件 `utils/ollama.js`，包含以下 API 封装：

1.  **配置**：
    -   `getOllamaUrl()`: 从 localStorage 获取服务地址，默认为 localhost:11434。

2.  **基础请求**：
    -   `request(endpoint, options)`: 封装 fetch，处理 headers 和 JSON 解析，统一错误处理。

3.  **流式请求**：
    -   `streamRequest(endpoint, options, onData, onError, onComplete)`:
    -   使用 `fetch` 和 `response.body.getReader()`。
    -   循环读取 stream chunk，使用 `TextDecoder` 解码。
    -   按行分割 JSON 数据（处理粘包），解析后回调 `onData`。

4.  **业务方法**：
    -   `getLocalModels()`: GET /api/tags
    -   `chatWithModel(model, prompt)`: POST /api/generate (stream: false)
    -   `streamChatWithModel(model, prompt, onData...)`: POST /api/generate (stream: true)
    -   `createModel`, `deleteModel`, `pullModel` 等对应 API。
```


