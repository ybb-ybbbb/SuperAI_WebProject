package logic

import (
	"context"

	"backend/rpc/internal/errorx"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/auth"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetUsersLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewGetUsersLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetUsersLogic {
	return &GetUsersLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

// 用户相关服务
func (l *GetUsersLogic) GetUsers(in *rpc.GetUsersReq) (*rpc.GetUsersResp, error) {
	// 检查AuthClient是否初始化
	if l.svcCtx.AuthClient == nil {
		l.Error("AuthClient未初始化")
		return nil, errorx.Internal("服务器内部错误")
	}

	// 调用外部AuthService的GetUsers方法
	authResp, err := l.svcCtx.AuthClient.GetUsers(l.ctx, &auth.GetUsersReq{
		Page:     in.Page,
		PageSize: in.PageSize,
	})
	if err != nil {
		l.Error("调用AuthService获取用户列表失败: ", err)
		return nil, errorx.Internal("服务器内部错误")
	}

	// 将外部服务的响应转换为主服务的响应格式
	respUsers := make([]*rpc.User, len(authResp.Users))
	for i, authUser := range authResp.Users {
		respUsers[i] = &rpc.User{
			Id:           authUser.Id,
			Username:     authUser.Username,
			Email:        authUser.Email,
			Avatar:       authUser.Avatar,
			CreatedAt:    authUser.CreatedAt,
			UpdatedAt:    authUser.UpdatedAt,
			IsVip:        authUser.IsVip,
			VipExpiresAt: authUser.VipExpiresAt,
			AutoRenew:    authUser.AutoRenew,
		}
	}

	return &rpc.GetUsersResp{
		Users: respUsers,
		Total: authResp.Total,
	}, nil
}
