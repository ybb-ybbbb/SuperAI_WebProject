package main

import (
	"fmt"
	"log"

	"go-react-demo/api"
	"go-react-demo/config"
	"go-react-demo/model"
	"go-react-demo/utils"
)

func main() {
	// 初始化配置
	if err := config.InitConfig(); err != nil {
		log.Fatalf("初始化配置失败: %v", err)
	}

	// 初始化数据库连接
	if err := utils.InitDB(); err != nil {
		log.Fatalf("初始化数据库失败: %v", err)
	}

	// 自动迁移模型
	if err := utils.GetDB().AutoMigrate(&model.User{}, &model.VipPlan{}, &model.VipRecord{}, &model.VipOrder{}); err != nil {
		log.Fatalf("模型迁移失败: %v", err)
	}

	// 设置路由
	r := api.SetupRouter()

	// 启动服务器
	serverConfig := config.GlobalConfig.Server
	addr := fmt.Sprintf("%s:%d", serverConfig.Host, serverConfig.Port)
	log.Printf("服务器启动成功，监听地址: %s", addr)
	
	if err := r.Run(addr); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
