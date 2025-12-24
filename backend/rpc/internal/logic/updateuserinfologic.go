package logic

import (
	"context"

	"backend/rpc/internal/errorx"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/auth"
	"backend/rpc/pb/super"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateUserInfoLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewUpdateUserInfoLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateUserInfoLogic {
	return &UpdateUserInfoLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *UpdateUserInfoLogic) UpdateUserInfo(in *super.UpdateUserInfoReq) (*super.UpdateUserInfoResp, error) {
	// 检查AuthClient是否初始化
	if l.svcCtx.AuthClient == nil {
		l.Error("AuthClient未初始化")
		return nil, errorx.Internal("服务器内部错误")
	}

	// 调用外部AuthService的UpdateUserInfo方法
	authResp, err := l.svcCtx.AuthClient.UpdateUserInfo(l.ctx, &auth.UpdateUserInfoReq{
		UserId:   in.UserId,
		Username: in.Username,
		Email:    in.Email,
		Avatar:   in.Avatar,
	})
	if err != nil {
		l.Error("调用AuthService更新用户信息失败: ", err)
		return nil, errorx.Internal("更新用户信息失败，请稍后重试")
	}

	// 将外部服务的响应转换为主服务的响应格式
	return &super.UpdateUserInfoResp{
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
	}, nil
}
