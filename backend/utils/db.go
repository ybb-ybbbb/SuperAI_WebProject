package utils

import (
	"log"
	"time"

	"backend/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB 全局数据库实例
var DB *gorm.DB

// InitDB 初始化数据库连接
func InitDB() error {
	// 配置gorm日志
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// 连接SQLite数据库（简化版，使用内存数据库）
	var err error
	DB, err = gorm.Open(sqlite.Open("superai.db"), gormConfig)
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

	// 自动迁移数据库表
	if err := autoMigrate(); err != nil {
		return err
	}

	log.Println("数据库连接成功")
	return nil
}

// autoMigrate 自动迁移数据库表
func autoMigrate() error {
	return DB.AutoMigrate(
		&model.User{},
		&model.VipPlan{},
		&model.VipOrder{},
		&model.VipRecord{},
	)
}

// GetDB 获取数据库实例，并确保连接有效
func GetDB() *gorm.DB {
	// 检查连接是否有效
	sqlDB, err := DB.DB()
	if err != nil {
		// 如果获取底层sql.DB失败，尝试重新初始化
		InitDB()
		return DB
	}

	// 使用Ping检查连接是否活跃
	if err := sqlDB.Ping(); err != nil {
		// 如果连接无效，重新初始化
		InitDB()
	}

	return DB
}
