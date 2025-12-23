package logic

import (
	"context"

	"backend/rpc/internal/errorx"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/auth"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type DeleteUserLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewDeleteUserLogic(ctx context.Context, svcCtx *svc.ServiceContext) *DeleteUserLogic {
	return &DeleteUserLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *DeleteUserLogic) DeleteUser(in *rpc.DeleteUserReq) (*rpc.DeleteUserResp, error) {
	// 检查AuthClient是否初始化
	if l.svcCtx.AuthClient == nil {
		l.Error("AuthClient未初始化")
		return nil, errorx.Internal("服务器内部错误")
	}

	// 调用外部AuthService的DeleteUser方法
	_, err := l.svcCtx.AuthClient.DeleteUser(l.ctx, &auth.DeleteUserReq{
		UserId: in.UserId,
	})
	if err != nil {
		l.Error("调用AuthService删除用户失败: ", err)
		return nil, errorx.Internal("删除用户失败，请稍后重试")
	}

	// 构建响应
	return &rpc.DeleteUserResp{}, nil
}
