# SuperAI_WebProject
# Go React 全栈项目

这是一个使用 Go 语言作为后端，React + Vite 作为前端的全栈项目。

## 项目结构

```
go-react-demo/
├── backend/          # Go 后端
│   ├── utils/        # 工具函数
│   │   └── db.go     # 数据库相关
│   ├── go.mod        # Go 模块依赖
│   ├── go.sum        # Go 模块校验和
│   └── main.go       # 后端入口文件
└── frontend/         # React 前端
    ├── src/          # 前端源码
    │   ├── App.css   # 应用样式
    │   └── App.jsx   # 应用主组件
    ├── .gitignore    # Git 忽略文件
    ├── README.md     # 前端说明文档
    └── index.html    # HTML 入口文件
```

## 技术栈

- **后端**: Go
- **前端**: React 18 + Vite
- **构建工具**: Vite

## 运行项目

### 后端

1. 进入后端目录
```bash
cd backend_backup_20251219_103342
```

2. 运行后端服务
```bash
go run main.go
```

### 前端

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动前端开发服务器
```bash
npm run dev
```

# 终止项目相关的node进程
```bash
pkill -f "vite"
pkill -f "esbuild"
```

### 指定端口启动前端开发服务器
```bash
npm run dev -- --port 5179
```
win 端口查询方法
netstat -ano | findstr :8080

## 项目说明

这是一个简单的全栈项目示例，展示了如何使用 Go 和 React 构建现代化的 Web 应用。后端提供 API 服务，前端负责用户界面和交互。

## 开发指南

### 后端开发

- 使用 Go 1.18+ 版本
- 依赖管理使用 Go Modules
- 主要逻辑在 `main.go` 文件中

### 前端开发

- 使用 React 18 钩子（Hooks）
- 使用 Vite 进行开发和构建
- 样式使用 CSS

## 许可证

MIT