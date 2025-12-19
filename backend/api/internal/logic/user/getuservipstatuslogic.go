package user

import (
	"context"

	"backend/api/internal/svc"
	"backend/api/internal/types"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetUserVipStatusLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetUserVipStatusLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetUserVipStatusLogic {
	return &GetUserVipStatusLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetUserVipStatusLogic) GetUserVipStatus(req *types.GetUserInfoReq) (resp *types.GetUserVipStatusResp, err error) {
	// 调用RPC服务获取用户VIP状态
	rpcResp, err := l.svcCtx.SuperRpcClient.GetUserVipStatus(l.ctx, &rpc.GetUserVipStatusReq{
		UserId: req.UserId,
	})
	if err != nil {
		return &types.GetUserVipStatusResp{
			BaseResp: types.BaseResp{
				Code:    500,
				Message: "调用RPC服务失败: " + err.Error(),
				Success: false,
			},
		}, nil
	}

	return &types.GetUserVipStatusResp{
		BaseResp: types.BaseResp{
			Code:    int(rpcResp.Base.Code),
			Message: rpcResp.Base.Message,
			Success: rpcResp.Base.Success,
		},
		Data: types.UserVipStatusData{
			IsVip:     rpcResp.IsVip,
			ExpiresAt: rpcResp.ExpiresAt,
			AutoRenew: rpcResp.AutoRenew,
		},
	}, nil
}
