# SuperAI WebProject 开发规则

## 🎯 核心开发规范（必须遵守）

### 1. 代码检查与格式化

#### 前端 (React + Vite)
- **ESLint**: 使用 `npm run lint` 检查，规则已在 `eslint.config.js` 配置
- **Prettier**: 提交前必须格式化代码

#### 后端 (Go + Gin)
- **格式化**: `gofmt -w .`
- **静态检查**: `go vet ./...`
- **推荐深度检查**: 使用 `golangci-lint run`

### 2. Git 工作流（严格强制执行）

#### 分支规范
- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支

#### 提交规范（必须使用 Conventional Commits）
```
feat: 新增功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 代码重构
test: 测试相关
chore: 构建/依赖
```

### 3. 项目结构（必须遵守）

#### 后端结构
```
backend/
├── api/           # 控制器层
├── config/        # 配置
├── model/         # 数据模型
├── service/       # 业务逻辑
├── utils/         # 工具函数
└── main.go        # 入口
```

#### 前端结构
```
frontend/src/
├── components/    # 可复用组件
├── pages/         # 页面组件
├── hooks/         # 自定义Hooks
├── utils/         # 工具函数
└── services/      # API服务
```

### 4. 编码规范（关键要求）

#### 前端规范
- 组件使用 PascalCase: `UserProfile.jsx`
- 函数使用 camelCase: `getUserData()`
- 常量使用 UPPER_CASE: `API_BASE_URL`
- Hooks 必须放在组件顶部
- API 调用统一在 `services/` 目录管理
- 样式文件与组件同名：`ComponentName.module.css`

#### 后端规范
- 包名小写: `userservice`
- 结构体/方法 PascalCase: `UserService`
- 变量 camelCase: `userName`
- 控制器返回统一JSON格式：`{"code": 200, "data": {}, "message": "success"}`
- 错误必须处理，不能忽略
- 日志记录关键操作

### 5. 开发流程（标准操作）

#### 环境准备
```bash
# 前端
cd frontend && npm install

# 后端  
cd backend && go mod tidy
```

#### 开发命令
```bash
# 前端开发
npm run dev

# 后端开发
go run main.go

# 代码检查
npm run lint        # 前端
go vet ./...        # 后端
```

### 6. 安全要求（必须实现）
- API 必须添加身份验证
- 用户输入必须验证
- 敏感数据必须加密
- SQL 必须使用参数化查询

### 7. 性能要求（建议实现）
- 前端：React.memo、懒加载、图片优化
- 后端：数据库索引、查询优化、缓存

## ⚠️ 注意事项（AI特别提醒）
- 每次生成代码前：必须检查当前目录结构
- 生成API时：必须同时生成前端调用代码和后端处理逻辑
- 数据库操作：必须包含错误处理和事务管理
- 组件生成：必须包含PropTypes或TypeScript类型定义
- 错误处理：必须实现，不能有空的catch块

## 📋 优先级说明
- **P0（必须）**: 代码检查、项目结构
- **P1（重要）**: 编码规范、安全要求
- **P2（建议）**: 性能优化、测试覆盖

## 💡 使用说明

### 给开发者的提示
```
请基于以下开发规范为SuperAI项目开发[功能名称]：

技术栈：React 19 + Go 1.24 + MySQL

**必须遵守：**
1. 代码结构按照规范组织
2. 提交信息使用Conventional Commits
3. 包含完整的错误处理
4. 前端组件使用PascalCase命名

**功能需求：**
[具体需求描述]

**输出要求：**
1. 完整的文件路径
2. 前后端完整代码
3. 必要的数据库迁移
4. API接口文档
```

### 开发检查清单
- [ ] 代码已通过ESLint/gofmt检查
- [ ] 提交信息符合规范
- [ ] 文件路径正确
- [ ] 错误处理完整
- [ ] 安全要求满足
- [ ] 性能优化考虑

## 📄 文档信息
- **版本**: 2.0
- **最后更新**: 2025年12月18日
- **适用项目**: SuperAI WebProject
- **技术栈**: React 19.2.0 + Vite 7.2.4 + Go 1.24.3 + Gin 1.11.0 + MySQL