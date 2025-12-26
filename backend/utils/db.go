package utils

import (
	"backend/model"
	"fmt"

	"github.com/spf13/viper"
	"github.com/xuxinzhi007/dbconnector"
	"gorm.io/gorm"
)

// DB 全局数据库实例（兼容旧代码）
var DB *gorm.DB

// InitConfig 初始化配置
func InitConfig() error {
	// 设置配置文件路径
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")

	// 添加多个配置文件路径，支持从不同目录读取
	viper.AddConfigPath("./config")                                                 // 当前目录下的config
	viper.AddConfigPath("../config")                                                // 父目录下的config
	viper.AddConfigPath("../../config")                                             // 祖父目录下的config
	viper.AddConfigPath("/Users/admin/Documents/SuperAI_WebProject/backend/config") // 绝对路径

	// 读取配置文件
	if err := viper.ReadInConfig(); err != nil {
		return fmt.Errorf("读取配置文件失败: %v", err)
	}

	return nil
}

// InitDB 初始化数据库连接（兼容旧代码）
func InitDB() error {
	// 注册所有模型
	dbconnector.RegisterModels(
		&model.User{},
		&model.VipPlan{},
		&model.VipOrder{},
		&model.VipRecord{},
		&model.AIUsage{},
	)

	// 直接使用 viper 配置初始化数据库
	// dbconnector.InitDBWithViper() 会从 viper 中读取配置
	if err := dbconnector.InitDBWithViper(); err != nil {
		return fmt.Errorf("初始化数据库失败: %v", err)
	}

	// 更新全局DB实例，兼容旧代码
	DB = dbconnector.GetDB()

	return nil
}

// GetDB 获取数据库实例（兼容旧代码）
func GetDB() *gorm.DB {
	// 如果全局DB实例为空，尝试初始化
	if DB == nil {
		if err := InitDB(); err != nil {
			return nil
		}
	}

	// 使用dbconnector获取DB实例
	return dbconnector.GetDB()
}