package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"time"
)

func main() {
	// 定义服务列表
	services := []struct {
		name    string
		path    string
		command []string
		delay   time.Duration
	}{
		{
			name:    "Auth Service",
			path:    "/Users/admin/Documents/SuperAI_WebProject/SuperAI_WebProject_Auth_副本/rpc",
			command: []string{"go", "run", "authservice.go"},
			delay:   2 * time.Second,
		},
		{
			name:    "Super Service",
			path:    "/Users/admin/Documents/SuperAI_WebProject/backend/rpc",
			command: []string{"go", "run", "super.go"},
			delay:   2 * time.Second,
		},
		{
			name:    "API Service",
			path:    "/Users/admin/Documents/SuperAI_WebProject/backend/api",
			command: []string{"go", "run", "super.go"},
			delay:   2 * time.Second,
		},
	}

	fmt.Println("========================================")
	fmt.Println("Super启动文件 - 统一管理服务启动")
	fmt.Println("========================================")

	// 启动所有服务
	for _, service := range services {
		go func(s struct {
			name    string
			path    string
			command []string
			delay   time.Duration
		}) {
			// 延迟启动
			time.Sleep(s.delay)

			// 切换到服务目录
			cwd, err := os.Getwd()
			if err != nil {
				log.Printf("%s - 无法获取当前目录: %v\n", s.name, err)
				return
			}

			err = os.Chdir(s.path)
			if err != nil {
				log.Printf("%s - 无法切换到目录 %s: %v\n", s.name, s.path, err)
				os.Chdir(cwd)
				return
			}
			defer os.Chdir(cwd)

			// 启动服务
			fmt.Printf("%s - 启动中...\n", s.name)
			cmd := exec.Command(s.command[0], s.command[1:]...)
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr

			err = cmd.Run()
			if err != nil {
				log.Printf("%s - 启动失败: %v\n", s.name, err)
			}
		}(service)
	}

	fmt.Println("所有服务已启动...")
	fmt.Println("按 Ctrl+C 停止所有服务")

	// 保持主进程运行
	select {}
}
