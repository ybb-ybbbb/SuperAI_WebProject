package vip

import (
	"context"

	"backend/api/internal/svc"
	"backend/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type CreateVipPlanLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewCreateVipPlanLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CreateVipPlanLogic {
	return &CreateVipPlanLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CreateVipPlanLogic) CreateVipPlan(req *types.CreateVipPlanReq) (resp *types.CreateVipPlanResp, err error) {
	// todo: add your logic here and delete this line

	return
}
