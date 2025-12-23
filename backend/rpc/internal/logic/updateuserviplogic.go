package logic

import (
	"context"
	"strconv"
	"time"

	"backend/model"
	"backend/rpc/internal/errorx"
	"backend/rpc/internal/svc"
	"backend/rpc/pb/auth"
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
	// 检查AuthClient是否初始化
	if l.svcCtx.AuthClient == nil {
		l.Error("AuthClient未初始化")
		return nil, errorx.Internal("服务器内部错误")
	}

	// 1. 调用外部AuthService的UpdateUserVip方法
	authResp, err := l.svcCtx.AuthClient.UpdateUserVip(l.ctx, &auth.UpdateUserVipReq{
		UserId:     in.UserId,
		IsVip:      in.IsVip,
		VipExpires: in.VipExpires,
	})
	if err != nil {
		l.Error("调用AuthService更新用户VIP状态失败: ", err)
		return nil, errorx.Internal("更新用户VIP状态失败，请稍后重试")
	}

	// 2. 同步更新本地数据库中的用户VIP状态
	// 查找用户
	var user model.User
	userID, err := strconv.ParseUint(in.UserId, 10, 64)
	if err != nil {
		l.Error("解析用户ID失败: ", err)
		return nil, errorx.NotFound("用户不存在")
	}

	result := l.svcCtx.DB.First(&user, userID)
	if result.Error != nil {
		l.Error("查找用户失败: ", result.Error)
		// 外部服务已更新成功，本地同步失败不影响主流程
		return &rpc.UpdateUserVipResp{
			User: &rpc.User{
				Id:           authResp.User.Id,
				Username:     authResp.User.Username,
				Email:        authResp.User.Email,
				Avatar:       authResp.User.Avatar,
				CreatedAt:    authResp.User.CreatedAt,
				UpdatedAt:    authResp.User.UpdatedAt,
				IsVip:        authResp.User.IsVip,
				VipExpiresAt: authResp.User.VipExpiresAt,
				AutoRenew:    authResp.User.AutoRenew,
			},
		}, nil
	}

	// 3. 更新本地用户VIP状态和记录
	if in.IsVip {
		// 激活VIP，创建VIP记录
		// 解析VIP过期时间
		vipExpires, err := time.Parse("2006-01-02 15:04:05", in.VipExpires)
		if err != nil {
			l.Error("解析VIP过期时间失败: ", err)
			// 外部服务已更新成功，本地同步失败不影响主流程
			return &rpc.UpdateUserVipResp{
				User: &rpc.User{
					Id:           authResp.User.Id,
					Username:     authResp.User.Username,
					Email:        authResp.User.Email,
					Avatar:       authResp.User.Avatar,
					CreatedAt:    authResp.User.CreatedAt,
					UpdatedAt:    authResp.User.UpdatedAt,
					IsVip:        authResp.User.IsVip,
					VipExpiresAt: authResp.User.VipExpiresAt,
					AutoRenew:    authResp.User.AutoRenew,
				},
			}, nil
		}

		// 将用户所有VIP记录设置为非激活
		l.svcCtx.DB.Model(&model.VipRecord{}).Where("user_id = ?", user.ID).Update("is_active", false)

		// 创建新的VIP记录
		vipStart := time.Now()
		vipRecord := model.VipRecord{
			UserID:   user.ID,
			PlanID:   1, // 默认套餐ID，后续可以根据实际情况修改
			IsActive: true,
			StartAt:  vipStart,
			EndAt:    vipExpires,
		}

		// 保存VIP记录
		l.svcCtx.DB.Create(&vipRecord)

		// 更新用户VIP状态
		user.IsVip = true
		user.VipStartAt = &vipStart
		user.VipEndAt = &vipExpires
	} else {
		// 非激活状态，将用户VIP状态设置为false
		user.IsVip = false
		user.VipStartAt = nil
		user.VipEndAt = nil

		// 将用户所有VIP记录设置为非激活
		l.svcCtx.DB.Model(&model.VipRecord{}).Where("user_id = ?", user.ID).Update("is_active", false)
	}

	// 保存用户信息
	l.svcCtx.DB.Save(&user)

	// 构建响应
	return &rpc.UpdateUserVipResp{
		User: &rpc.User{
			Id:           authResp.User.Id,
			Username:     authResp.User.Username,
			Email:        authResp.User.Email,
			Avatar:       authResp.User.Avatar,
			CreatedAt:    authResp.User.CreatedAt,
			UpdatedAt:    authResp.User.UpdatedAt,
			IsVip:        authResp.User.IsVip,
			VipExpiresAt: authResp.User.VipExpiresAt,
			AutoRenew:    authResp.User.AutoRenew,
		},
	}, nil
}
