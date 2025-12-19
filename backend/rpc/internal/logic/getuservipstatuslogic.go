package logic

import (
	"context"

	"backend/model"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetUserVipStatusLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewGetUserVipStatusLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetUserVipStatusLogic {
	return &GetUserVipStatusLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

// 用户相关服务
func (l *GetUserVipStatusLogic) GetUserVipStatus(in *rpc.GetUserVipStatusReq) (*rpc.GetUserVipStatusResp, error) {
	var user model.User
	result := l.svcCtx.DB.First(&user, in.UserId)
	if result.Error != nil {
		return &rpc.GetUserVipStatusResp{
			Base: &rpc.BaseResp{
				Code:    404,
				Message: "用户不存在",
				Success: false,
			},
			IsVip: false,
		}, nil
	}

	vipEndAt := ""
	if user.VipEndAt != nil {
		vipEndAt = user.VipEndAt.Format("2006-01-02 15:04:05")
	}

	return &rpc.GetUserVipStatusResp{
		Base: &rpc.BaseResp{
			Code:    200,
			Message: "获取VIP状态成功",
			Success: true,
		},
		IsVip:      user.IsVip,
		ExpiresAt:  vipEndAt,
		AutoRenew:  false, // 模型中暂时没有auto_renew字段
	}, nil
}
