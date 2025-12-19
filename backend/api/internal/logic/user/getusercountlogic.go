package user

import (
	"context"

	"backend/api/internal/svc"
	"backend/api/internal/types"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetUserCountLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetUserCountLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetUserCountLogic {
	return &GetUserCountLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetUserCountLogic) GetUserCount(req *types.EmptyReq) (resp *types.GetUserCountResp, err error) {
	// 调用RPC服务获取用户总数
	rpcResp, err := l.svcCtx.SuperRpcClient.GetUserCount(l.ctx, &rpc.GetUserCountReq{})
	if err != nil {
		return &types.GetUserCountResp{
			BaseResp: types.BaseResp{
				Code:    500,
				Message: "调用RPC服务失败: " + err.Error(),
				Success: false,
			},
			Data: 0,
		}, nil
	}

	return &types.GetUserCountResp{
		BaseResp: types.BaseResp{
			Code:    int(rpcResp.Base.Code),
			Message: rpcResp.Base.Message,
			Success: rpcResp.Base.Success,
		},
		Data: int(rpcResp.Count),
	}, nil
}
