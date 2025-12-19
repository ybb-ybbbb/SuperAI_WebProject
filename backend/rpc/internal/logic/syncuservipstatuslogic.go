package logic

import (
	"context"
	"time"

	"backend/model"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type SyncUserVipStatusLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewSyncUserVipStatusLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SyncUserVipStatusLogic {
	return &SyncUserVipStatusLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}
// 用户相关服务
func (l *SyncUserVipStatusLogic) SyncUserVipStatus(in *rpc.SyncUserVipStatusReq) (*rpc.SyncUserVipStatusResp, error) {
	// 验证用户是否存在
	var user model.User
	result := l.svcCtx.DB.First(&user, in.UserId)
	if result.Error != nil {
		return &rpc.SyncUserVipStatusResp{
			Base: &rpc.BaseResp{
				Code:    404,
				Message: "用户不存在",
				Success: false,
			},
			IsVip: false,
		}, nil
	}

	// 检查用户的VIP记录，更新VIP状态
	// 这里简化处理，实际应该检查最新的VIP记录
	isVip := user.IsVip
	vipEndAt := ""
	if user.VipEndAt != nil {
		vipEndAt = user.VipEndAt.Format("2006-01-02 15:04:05")
		// 如果VIP已过期，更新状态
		if user.VipEndAt.Before(time.Now()) {
			isVip = false
			user.IsVip = false
			l.svcCtx.DB.Save(&user)
		}
	}

	return &rpc.SyncUserVipStatusResp{
		Base: &rpc.BaseResp{
			Code:    200,
			Message: "同步VIP状态成功",
			Success: true,
		},
		IsVip:     isVip,
		ExpiresAt: vipEndAt,
	}, nil
}
