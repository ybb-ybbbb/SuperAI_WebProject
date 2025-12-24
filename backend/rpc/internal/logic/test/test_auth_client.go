package main

import (
	"context"
	"fmt"

	"backend/rpc/pb/super"

	"github.com/zeromicro/go-zero/zrpc"
)

func main() {
	// 创建RPC客户端
	client := zrpc.MustNewClient(zrpc.RpcClientConf{
		Endpoints: []string{"localhost:8080"},
	})
	defer client.Conn().Close()

	// 创建Super客户端
	superClient := super.NewSuperClient(client.Conn())

	fmt.Println("=== 测试注册功能 ===")
	// 测试注册
	registerResp, err := superClient.Register(context.Background(), &super.RegisterReq{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "testpassword",
	})
	if err != nil {
		fmt.Printf("注册失败: %v\n", err)
	} else {
		fmt.Printf("注册成功: 用户ID: %s, 用户名: %s\n", registerResp.User.Id, registerResp.User.Username)
	}

	fmt.Println("\n=== 测试登录功能 ===")
	// 测试登录
	loginResp, err := superClient.Login(context.Background(), &super.LoginReq{
		Username: "testuser",
		Password: "testpassword",
	})
	if err != nil {
		fmt.Printf("登录失败: %v\n", err)
	} else {
		fmt.Printf("登录成功: 用户ID: %s, 用户名: %s, Token: %s\n", loginResp.User.Id, loginResp.User.Username, loginResp.Token)
	}

	fmt.Println("\n=== 测试获取用户信息功能 ===")
	// 测试获取用户信息
	if loginResp != nil {
		getUserResp, err := superClient.GetUser(context.Background(), &super.GetUserReq{
			UserId: loginResp.User.Id,
		})
		if err != nil {
			fmt.Printf("获取用户信息失败: %v\n", err)
		} else {
			fmt.Printf("获取用户信息成功: 用户ID: %s, 用户名: %s, 邮箱: %s\n", getUserResp.User.Id, getUserResp.User.Username, getUserResp.User.Email)
		}
	}
}
