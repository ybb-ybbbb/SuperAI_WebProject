#!/bin/bash

echo "========================================"
echo "Super启动脚本 - 统一管理服务启动"
echo "========================================"

# 定义服务列表
services=( 
  "Auth Service" "/Users/admin/Documents/SuperAI_WebProject/SuperAI_WebProject_Auth_副本/rpc" "go run authservice.go" "2"
  "Super Service" "/Users/admin/Documents/SuperAI_WebProject/backend/rpc" "go run super.go" "2"
  "API Service" "/Users/admin/Documents/SuperAI_WebProject/backend/api" "go run super.go" "2"
)

# 启动所有服务
for ((i=0; i<${#services[@]}; i+=4)); do
  service_name=${services[$i]}
  service_path=${services[$i+1]}
  service_command=${services[$i+2]}
  delay=${services[$i+3]}
  
  echo "$service_name - 启动中..."
  
  # 在新的终端窗口中启动服务
  osascript -e "tell application \"Terminal\" to do script \"cd $service_path && echo '$service_name - 启动中...' && $service_command\""
  
  # 延迟启动下一个服务
  sleep $delay
done

echo "所有服务已启动..."
echo "请在各自的终端窗口查看服务状态"
echo "按 Ctrl+C 在各个终端窗口停止服务"
