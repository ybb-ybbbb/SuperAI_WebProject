package ai

import (
	"context"

	"backend/api/internal/svc"
	"backend/api/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AiRequestLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAiRequestLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AiRequestLogic {
	return &AiRequestLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AiRequestLogic) AiRequest(req *types.AIRequestReq) (resp *types.AIRequestResp, err error) {
	// todo: add your logic here and delete this line

	return
}
