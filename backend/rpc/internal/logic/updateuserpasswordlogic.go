package logic

import (
	"context"

	"backend/rpc/internal/errorx"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/auth"
	"backend/rpc/pb/super"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateUserPasswordLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewUpdateUserPasswordLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateUserPasswordLogic {
	return &UpdateUserPasswordLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *UpdateUserPasswordLogic) UpdateUserPassword(in *super.UpdateUserPasswordReq) (*super.UpdateUserPasswordResp, error) {
	// 检查AuthClient是否初始化
	if l.svcCtx.AuthClient == nil {
		l.Error("AuthClient未初始化")
		return nil, errorx.Internal("服务器内部错误")
	}

	// 调用外部AuthService的UpdateUserPassword方法
	_, err := l.svcCtx.AuthClient.UpdateUserPassword(l.ctx, &auth.UpdateUserPasswordReq{
		UserId:      in.UserId,
		OldPassword: in.OldPassword,
		NewPassword: in.NewPassword,
	})
	if err != nil {
		l.Error("调用AuthService更新密码失败: ", err)
		return nil, errorx.InvalidArgument("旧密码不正确")
	}

	// 构建响应
	return &super.UpdateUserPasswordResp{}, nil
}
