package config

import (
	"fmt"
	"log"

	"github.com/spf13/viper"
)

// Config 全局配置结构体
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

// ServerConfig 服务器配置结构体
type ServerConfig struct {
	Port int
	Host string
}

// DatabaseConfig 数据库配置结构体
type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	Charset  string
	ParseTime bool
	Loc      string
}

// GlobalConfig 全局配置实例
var GlobalConfig Config

// InitConfig 初始化配置
func InitConfig() error {
	// 设置配置文件路径
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")
	viper.AddConfigPath(".")

	// 读取配置文件
	if err := viper.ReadInConfig(); err != nil {
		return fmt.Errorf("读取配置文件失败: %v", err)
	}

	// 解析配置到结构体
	if err := viper.Unmarshal(&GlobalConfig); err != nil {
		return fmt.Errorf("解析配置失败: %v", err)
	}

	log.Println("配置加载成功")
	return nil
}

// GetDSN 获取数据库DSN
func (db DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=%t&loc=%s",
		db.User, db.Password, db.Host, db.Port, db.DBName, db.Charset, db.ParseTime, db.Loc)
}
