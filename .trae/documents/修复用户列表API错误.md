## 问题分析

前端在请求 `http://localhost:8080/api/users` 时出现 `net::ERR_FAILED` 错误，无法显示用户列表。通过检查代码发现以下问题：

1. **路由不匹配**：前端请求的是 `/api/users`（复数），但后端路由配置中只有 `/api/user`（单数）
2. **方法名称与功能不符**：`GetUserInfo` 方法实际返回所有用户信息，但名称暗示只返回单个用户信息
3. **缺少对应端点**：后端缺少 `/api/users` 的路由定义

## 修复方案

### 1. 调整控制器方法
- 将 `GetUserInfo` 方法重命名为 `GetUsers`，明确其返回所有用户的功能
- 确保该方法正确返回所有用户列表

### 2. 添加匹配路由
在 `backend/api/router.go` 中添加 `/api/users` 路由，指向 `GetUsers` 方法，确保与前端请求对齐

### 3. 可选：实现真正的 `GetUserInfo` 方法
如果需要，为单个用户信息查询实现一个真正的 `GetUserInfo` 方法，路由可以保持为 `/api/user/info`

## 实施步骤

1. 编辑 `backend/api/user_controller.go` 文件：
   - 将 `GetUserInfo` 方法重命名为 `GetUsers`
   - 确保方法逻辑正确获取所有用户

2. 编辑 `backend/api/router.go` 文件：
   - 添加 `/api/users` 路由，指向 `GetUsers` 方法
   - 保持现有 `/api/user/info` 路由不变（或修改为指向单个用户信息方法）

3. 测试修复后的API
   - 使用浏览器或API测试工具验证 `/api/users` 端点是否能正常返回用户列表

4. 验证前端联调
   - 确保前端 `UserList.jsx` 组件能够成功获取并显示用户数据

## 预期结果

修复后，前端请求 `http://localhost:8080/api/users` 将返回数据库中的用户列表，`UserList` 组件能够正常显示用户数据，不再报错。同时，代码的方法名称和路由设计更加清晰和一致。