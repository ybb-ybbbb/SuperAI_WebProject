package logic

import (
	"context"

	"backend/model"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type CheckUserVipLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewCheckUserVipLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CheckUserVipLogic {
	return &CheckUserVipLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}
// 用户相关服务
func (l *CheckUserVipLogic) CheckUserVip(in *rpc.CheckUserVipReq) (*rpc.CheckUserVipResp, error) {
	var user model.User
	result := l.svcCtx.DB.First(&user, in.UserId)
	if result.Error != nil {
		return &rpc.CheckUserVipResp{
			Base: &rpc.BaseResp{
				Code:    404,
				Message: "用户不存在",
				Success: false,
			},
			IsVip: false,
		}, nil
	}

	return &rpc.CheckUserVipResp{
		Base: &rpc.BaseResp{
			Code:    200,
			Message: "检查VIP状态成功",
			Success: true,
		},
		IsVip: user.IsVip,
	}, nil
}
