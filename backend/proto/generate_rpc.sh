#!/bin/bash

# 生成主服务（Super）的完整 RPC 代码（服务端 + 客户端）
echo "生成 Super 服务端代码..."
goctl rpc protoc superservice.proto --go_out=../rpc/pb --go-grpc_out=../rpc/pb --zrpc_out=../rpc

# 生成外部服务的客户端代码（只生成 pb 文件，不生成 zrpc 框架）
echo "生成 AuthService 客户端代码..."
protoc --go_out=../rpc/pb --go-grpc_out=../rpc/pb authservice.proto

# 如果有更多外部服务，继续添加
# echo "生成 XXX 客户端代码..."
# protoc --go_out=../rpc/pb --go-grpc_out=../rpc/pb xxx.proto

echo "代码生成完成！"
echo "主服务: superservice.go (服务端)"
echo "外部服务客户端: pb/auth/ (仅客户端调用)"
