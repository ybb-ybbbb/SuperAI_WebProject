package api

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

// SetupRouter 设置路由
func SetupRouter() *gin.Engine {
	// 创建gin引擎
	r := gin.Default()

	// 配置CORS中间件
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174"}, // 允许前端域名
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 创建用户控制器实例
	userController := NewUserController()

	// API分组
	api := r.Group("/api")
	{
		// 用户相关路由
		user := api.Group("/user")
		{
			user.POST("/register", userController.Register)
			user.POST("/login", userController.Login)
			user.GET("/info", userController.GetUserInfo)
			// VIP相关路由
			user.POST("/:id/vip", userController.UpdateUserVip)
			user.GET("/:id/vip", userController.GetUserVipStatus)
			user.GET("/:id/vip/check", userController.CheckUserVip)
		}
	}

	return r
}
