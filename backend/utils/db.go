package utils

import (
	"log"
	"time"

	"go-react-demo/config"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB 全局数据库实例
var DB *gorm.DB

// InitDB 初始化数据库连接
func InitDB() error {
	// 获取数据库配置
	dbConfig := config.GlobalConfig.Database
	
	// 配置gorm日志
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}
	
	// 连接数据库
	dsn := dbConfig.GetDSN()
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), gormConfig)
	if err != nil {
		return err
	}
	
	// 配置连接池
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	
	// 设置最大空闲连接数
	sqlDB.SetMaxIdleConns(10)
	// 设置最大打开连接数
	sqlDB.SetMaxOpenConns(100)
	// 设置连接最大生命周期
	sqlDB.SetConnMaxLifetime(1 * time.Hour)
	
	log.Println("数据库连接成功")
	return nil
}

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}
