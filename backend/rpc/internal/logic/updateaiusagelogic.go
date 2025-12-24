package logic

import (
	"context"
	"errors"
	"strconv"
	"time"

	"backend/model"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/super"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateAIUsageLogic struct {
	ctx    context.Context
	svcCtx *svc.ServiceContext
	logx.Logger
}

func NewUpdateAIUsageLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateAIUsageLogic {
	return &UpdateAIUsageLogic{
		ctx:    ctx,
		svcCtx: svcCtx,
		Logger: logx.WithContext(ctx),
	}
}

func (l *UpdateAIUsageLogic) UpdateAIUsage(in *super.UpdateAIUsageReq) (*super.UpdateAIUsageResp, error) {
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
	}

	// 确定使用限制
	chatLimit := 10
	contentLimit := 5
	analysisLimit := 3
	if user.IsVip {
		chatLimit = 100
		contentLimit = 50
		analysisLimit = 20
	}

	// 根据使用类型增加相应的使用次数并检查限制
	switch in.UsageType {
	case "chat":
		if user.AIChatCount >= chatLimit {
			return nil, errors.New("AI聊天使用次数已达上限")
		}
		user.AIChatCount++
	case "content":
		if user.AIContentCount >= contentLimit {
			return nil, errors.New("AI内容生成使用次数已达上限")
		}
		user.AIContentCount++
	case "analysis":
		if user.AIAnalysisCount >= analysisLimit {
			return nil, errors.New("AI数据分析使用次数已达上限")
		}
		user.AIAnalysisCount++
	default:
		return nil, errors.New("无效的使用类型，支持的类型：chat、content、analysis")
	}

	// 保存更新
	if err := l.svcCtx.DB.Save(&user).Error; err != nil {
		return nil, err
	}

	// 构建响应
	lastResetAt := ""
	if user.AILastResetAt != nil {
		lastResetAt = user.AILastResetAt.Format(time.RFC3339)
	}

	return &super.UpdateAIUsageResp{
		Usage: &super.AIUsageData{
			IsVip:            user.IsVip,
			AiChatCount:      int32(user.AIChatCount),
			AiChatLimit:      int32(chatLimit),
			AiContentCount:   int32(user.AIContentCount),
			AiContentLimit:   int32(contentLimit),
			AiAnalysisCount:  int32(user.AIAnalysisCount),
			AiAnalysisLimit:  int32(analysisLimit),
			AiLastResetAt:    lastResetAt,
		},
	}, nil
}
