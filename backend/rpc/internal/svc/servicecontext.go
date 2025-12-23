package svc

import (
	"backend/rpc/internal/config"
	"backend/rpc/pb/auth"
	"backend/utils"

	"github.com/zeromicro/go-zero/zrpc"
	"gorm.io/gorm"
)

type ServiceContext struct {
	Config     config.Config
	DB         *gorm.DB
	AuthClient auth.AuthClient // 外部认证服务客户端
}

func NewServiceContext(c config.Config) *ServiceContext {
	// 初始化配置
	if err := utils.InitConfig(); err != nil {
		panic(err)
	}

	// 初始化数据库连接
	if err := utils.InitDB(); err != nil {
		panic(err)
	}

	// 初始化外部服务客户端
	var authClient auth.AuthClient
	// 如果配置了AuthRpc，则初始化AuthClient
	// 支持两种方式：直接指定Endpoints或使用Etcd服务发现
	if len(c.AuthRpc.Endpoints) > 0 || len(c.AuthRpc.Etcd.Hosts) > 0 {
		authConn := zrpc.MustNewClient(c.AuthRpc)
		authClient = auth.NewAuthClient(authConn.Conn())
	}

	return &ServiceContext{
		Config:     c,
		DB:         utils.GetDB(),
		AuthClient: authClient,
	}
}
