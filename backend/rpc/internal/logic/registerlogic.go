package logic

import (
	"context"

	"backend/rpc/internal/errorx"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/auth"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type RegisterLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewRegisterLogic(ctx context.Context, svcCtx *svc.ServiceContext) *RegisterLogic {
	return &RegisterLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

// 用户相关服务
func (l *RegisterLogic) Register(in *rpc.RegisterReq) (*rpc.RegisterResp, error) {
	// 检查AuthClient是否初始化
	if l.svcCtx.AuthClient == nil {
		l.Error("AuthClient未初始化")
		return nil, errorx.Internal("服务器内部错误")
	}

	// 调用外部AuthService的Register方法
	authResp, err := l.svcCtx.AuthClient.Register(l.ctx, &auth.RegisterReq{
		Username: in.Username,
		Email:    in.Email,
		Password: in.Password,
	})
	if err != nil {
		l.Error("调用AuthService注册失败: ", err)
		return nil, errorx.Internal("注册失败，请稍后重试")
	}

	// 将外部服务的响应转换为主服务的响应格式
	return &rpc.RegisterResp{
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
