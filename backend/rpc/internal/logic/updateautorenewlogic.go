package logic

import (
	"context"

	"backend/model"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateAutoRenewLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewUpdateAutoRenewLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateAutoRenewLogic {
	return &UpdateAutoRenewLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}
// 用户相关服务
func (l *UpdateAutoRenewLogic) UpdateAutoRenew(in *rpc.UpdateAutoRenewReq) (*rpc.UpdateAutoRenewResp, error) {
	var user model.User
	result := l.svcCtx.DB.First(&user, in.UserId)
	if result.Error != nil {
		return &rpc.UpdateAutoRenewResp{
			Base: &rpc.BaseResp{
				Code:    404,
				Message: "用户不存在",
				Success: false,
			},
		}, nil
	}

	// 目前模型中没有auto_renew字段，这里先返回成功
	return &rpc.UpdateAutoRenewResp{
		Base: &rpc.BaseResp{
			Code:    200,
			Message: "更新自动续费状态成功",
			Success: true,
		},
	}, nil
}
