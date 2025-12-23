# 外部服务调用说明

## 架构说明

- **super.go**: 主服务启动文件（本地服务）
- **外部服务**: 通过 RPC 客户端调用（如 AuthService）

## 添加新的外部服务

### 1. 添加 proto 文件

在 `backend/proto/` 目录下添加外部服务的 `.proto` 文件

### 2. 修改生成脚本

编辑 `backend/proto/generate_rpc.sh`，添加客户端代码生成：

```bash
# 只生成 pb 文件，不生成 zrpc 框架
protoc --go_out=../rpc/pb --go-grpc_out=../rpc/pb newservice.proto
```

### 3. 更新配置

在 `backend/rpc/internal/config/config.go` 中添加：

```go
type Config struct {
    zrpc.RpcServerConf
    AuthRpc       zrpc.RpcClientConf `json:",optional"`
    NewServiceRpc zrpc.RpcClientConf `json:",optional"` // 新增
}
```

### 4. 初始化客户端

在 `backend/rpc/internal/svc/servicecontext.go` 中添加：

```go
import "backend/rpc/pb/newservice"

type ServiceContext struct {
    Config           config.Config
    DB               *gorm.DB
    AuthClient       auth.AuthClient
    NewServiceClient newservice.NewServiceClient // 新增
}

func NewServiceContext(c config.Config) *ServiceContext {
    // ... 现有代码 ...
    
    // 初始化新服务客户端
    var newServiceClient newservice.NewServiceClient
    if len(c.NewServiceRpc.Endpoints) > 0 {
        conn := zrpc.MustNewClient(c.NewServiceRpc)
        newServiceClient = newservice.NewNewServiceClient(conn.Conn())
    }
    
    return &ServiceContext{
        // ... 现有字段 ...
        NewServiceClient: newServiceClient,
    }
}
```

### 5. 在 Logic 中使用

```go
package logic

import (
    "context"
    "backend/rpc/pb/auth"
)

func (l *YourLogic) YourMethod(in *pb.YourReq) (*pb.YourResp, error) {
    // 调用外部认证服务
    authResp, err := l.svcCtx.AuthClient.Login(context.Background(), &auth.LoginReq{
        Username: in.Username,
        Password: in.Password,
    })
    if err != nil {
        return nil, err
    }
    
    // 使用返回的数据
    user := authResp.User
    
    return &pb.YourResp{
        // ...
    }, nil
}
```

## 配置文件示例

在 `backend/rpc/etc/super.yaml` 中配置外部服务：

```yaml
Name: super.rpc
ListenOn: 0.0.0.0:8080
Etcd:
  Hosts:
  - 127.0.0.1:2379
  Key: super.rpc

# 方式1: 通过 Etcd 服务发现
AuthRpc:
  Etcd:
    Hosts:
    - 127.0.0.1:2379
    Key: auth.rpc

# 方式2: 直接指定地址
# AuthRpc:
#   Endpoints:
#   - 127.0.0.1:8081
#   - 127.0.0.1:8082
```

## 优势

- ✅ 只有一个主服务启动文件（super.go）
- ✅ 外部服务通过客户端调用，不会生成额外的启动文件
- ✅ 支持服务发现（Etcd）或直连
- ✅ 便于微服务架构扩展
