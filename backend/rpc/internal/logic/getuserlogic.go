package logic

import (
	"context"

	"backend/rpc/internal/errorx"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/auth"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetUserLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewGetUserLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetUserLogic {
	return &GetUserLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *GetUserLogic) GetUser(in *rpc.GetUserReq) (*rpc.GetUserResp, error) {
	// 检查AuthClient是否初始化
	if l.svcCtx.AuthClient == nil {
		l.Error("AuthClient未初始化")
		return nil, errorx.Internal("服务器内部错误")
	}

	// 调用外部AuthService的GetUser方法
	authResp, err := l.svcCtx.AuthClient.GetUser(l.ctx, &auth.GetUserReq{
		UserId: in.UserId,
	})
	if err != nil {
		l.Error("调用AuthService获取用户失败: ", err)
		return nil, errorx.NotFound("用户不存在")
	}

	// 将外部服务的响应转换为主服务的响应格式
	return &rpc.GetUserResp{
		User: &rpc.User{
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
	}, nil
}
