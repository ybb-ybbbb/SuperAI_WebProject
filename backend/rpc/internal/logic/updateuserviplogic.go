package logic

import (
	"context"

	"backend/rpc/internal/svc"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateUserVipLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewUpdateUserVipLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateUserVipLogic {
	return &UpdateUserVipLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *UpdateUserVipLogic) UpdateUserVip(in *rpc.UpdateUserVipReq) (*rpc.UpdateUserVipResp, error) {
	// todo: add your logic here and delete this line

	return &rpc.UpdateUserVipResp{}, nil
}
