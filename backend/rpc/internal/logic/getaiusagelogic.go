package logic

import (
	"context"
	"strconv"
	"time"

	"backend/model"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/super"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetAIUsageLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewGetAIUsageLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetAIUsageLogic {
	return &GetAIUsageLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

// AI使用量相关服务
func (l *GetAIUsageLogic) GetAIUsage(in *super.GetAIUsageReq) (*super.GetAIUsageResp, error) {
	// 解析用户ID
	userID, err := strconv.ParseUint(in.UserId, 10, 64)
	if err != nil {
		return nil, err
	}

	// 获取用户信息
	var user model.User
	if err := l.svcCtx.DB.First(&user, userID).Error; err != nil {
		return nil, err
	}

	// 检查是否需要重置使用次数（按月重置）
	now := time.Now()
	if user.AILastResetAt == nil || now.Month() != user.AILastResetAt.Month() || now.Year() != user.AILastResetAt.Year() {
		// 重置使用次数
		user.AIChatCount = 0
		user.AIContentCount = 0
		user.AIAnalysisCount = 0
		user.AILastResetAt = &now

		// 保存更新
		if err := l.svcCtx.DB.Save(&user).Error; err != nil {
			return nil, err
		}
	}

	// 确定使用限制
	chatLimit := int32(10)
	contentLimit := int32(5)
	analysisLimit := int32(3)
	if user.IsVip {
		chatLimit = int32(100)
		contentLimit = int32(50)
		analysisLimit = int32(20)
	}

	// 构建响应
	lastResetAt := ""
	if user.AILastResetAt != nil {
		lastResetAt = user.AILastResetAt.Format(time.RFC3339)
	}

	return &super.GetAIUsageResp{
		Usage: &super.AIUsageData{
			IsVip:            user.IsVip,
			AiChatCount:      int32(user.AIChatCount),
			AiChatLimit:      chatLimit,
			AiContentCount:   int32(user.AIContentCount),
			AiContentLimit:   contentLimit,
			AiAnalysisCount:  int32(user.AIAnalysisCount),
			AiAnalysisLimit:  analysisLimit,
			AiLastResetAt:    lastResetAt,
		},
	}, nil
}
