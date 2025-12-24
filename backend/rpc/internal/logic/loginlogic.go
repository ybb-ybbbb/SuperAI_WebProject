package logic

import (
	"context"

	"backend/rpc/internal/errorx"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/auth"
	"backend/rpc/pb/super"

	"github.com/zeromicro/go-zero/core/logx"
)

type LoginLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewLoginLogic(ctx context.Context, svcCtx *svc.ServiceContext) *LoginLogic {
	return &LoginLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *LoginLogic) Login(in *super.LoginReq) (*super.LoginResp, error) {
	// 检查AuthClient是否初始化
	if l.svcCtx.AuthClient == nil {
		l.Error("AuthClient未初始化")
		return nil, errorx.New(500, "服务未初始化")
	}

	// 调用外部AuthService的Login方法
	authResp, err := l.svcCtx.AuthClient.Login(l.ctx, &auth.LoginReq{
		Username: in.Username,
		Email:    in.Email,
		Password: in.Password,
	})
	if err != nil {
		l.Error("调用AuthService登录失败: ", err)
		return nil, errorx.New(401, "用户名或密码错误")
	}

	// 将外部服务的响应转换为主服务的响应格式
	return &super.LoginResp{
		User: &super.User{
			Id:           authResp.User.Id,
			Username:     authResp.User.Username,
			Email:        authResp.User.Email,
			Avatar:       authResp.User.Avatar,
			CreatedAt:    authResp.User.CreatedAt,
			UpdatedAt:    authResp.User.UpdatedAt,
			IsVip:        authResp.User.IsVip,
			VipExpiresAt: authResp.User.VipExpiresAt,
			AutoRenew:    authResp.User.AutoRenew,
		},
		Token: authResp.Token,
	}, nil
}
