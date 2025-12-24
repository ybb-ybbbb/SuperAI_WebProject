package user

import (
	"context"

	"backend/api/internal/svc"
	"backend/api/internal/types"
	"backend/rpc/pb/super"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetAIUsageLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetAIUsageLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetAIUsageLogic {
	return &GetAIUsageLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetAIUsageLogic) GetAIUsage(req *types.GetUserInfoReq) (resp *types.GetAIUsageResp, err error) {
	// 调用RPC服务获取AI使用量
	rpcResp, err := l.svcCtx.SuperRpcClient.GetAIUsage(l.ctx, &super.GetAIUsageReq{
		UserId: req.UserId,
	})
	if err != nil {
		return nil, err
	}

	// 转换RPC响应为API响应
	resp = &types.GetAIUsageResp{
		BaseResp: types.BaseResp{
			Code:    0,
			Message: "success",
			Success: true,
		},
		Data: types.AIUsageData{
			IsVip:            rpcResp.Usage.IsVip,
			AIChatCount:      int(rpcResp.Usage.AiChatCount),
			AIChatLimit:      int(rpcResp.Usage.AiChatLimit),
			AIContentCount:   int(rpcResp.Usage.AiContentCount),
			AIContentLimit:   int(rpcResp.Usage.AiContentLimit),
			AIAnalysisCount:  int(rpcResp.Usage.AiAnalysisCount),
			AIAnalysisLimit:  int(rpcResp.Usage.AiAnalysisLimit),
			AILastResetAt:    rpcResp.Usage.AiLastResetAt,
		},
	}

	return resp, nil
}
