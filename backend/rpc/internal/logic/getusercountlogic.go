package logic

import (
	"context"

	"backend/rpc/internal/errorx"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/auth"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetUserCountLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewGetUserCountLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetUserCountLogic {
	return &GetUserCountLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

// 用户相关服务
func (l *GetUserCountLogic) GetUserCount(in *rpc.GetUserCountReq) (*rpc.GetUserCountResp, error) {
	// 检查AuthClient是否初始化
	if l.svcCtx.AuthClient == nil {
		l.Error("AuthClient未初始化")
		return nil, errorx.Internal("服务器内部错误")
	}

	// 调用外部AuthService的GetUserCount方法
	authResp, err := l.svcCtx.AuthClient.GetUserCount(l.ctx, &auth.GetUserCountReq{})
	if err != nil {
		l.Error("调用AuthService获取用户数量失败: ", err)
		return nil, errorx.Internal("服务器内部错误")
	}

	// 构建响应
	return &rpc.GetUserCountResp{
		Count: authResp.Count,
	}, nil
}
