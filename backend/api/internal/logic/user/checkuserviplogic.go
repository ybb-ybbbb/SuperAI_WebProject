package user

import (
	"context"

	"backend/api/internal/svc"
	"backend/api/internal/types"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type CheckUserVipLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewCheckUserVipLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CheckUserVipLogic {
	return &CheckUserVipLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CheckUserVipLogic) CheckUserVip(req *types.CheckUserVipReq) (resp *types.CheckUserVipResp, err error) {
	// 调用RPC服务检查用户VIP状态
	rpcResp, err := l.svcCtx.SuperRpcClient.CheckUserVip(l.ctx, &rpc.CheckUserVipReq{
		UserId: req.UserId,
	})
	if err != nil {
		return &types.CheckUserVipResp{
			BaseResp: types.BaseResp{
				Code:    500,
				Message: "调用RPC服务失败: " + err.Error(),
				Success: false,
			},
			Data: false,
		}, nil
	}

	return &types.CheckUserVipResp{
		BaseResp: types.BaseResp{
			Code:    int(rpcResp.Base.Code),
			Message: rpcResp.Base.Message,
			Success: rpcResp.Base.Success,
		},
		Data: rpcResp.IsVip,
	}, nil
}
