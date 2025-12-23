package config

import "github.com/zeromicro/go-zero/zrpc"

type Config struct {
	zrpc.RpcServerConf
	// 外部服务配置
	AuthRpc zrpc.RpcClientConf `json:",optional"` // 外部认证服务
}
