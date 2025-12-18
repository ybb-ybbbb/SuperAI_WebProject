package main

import (
	"log"
	"time"

	"go-react-demo/config"
	"go-react-demo/model"
	"go-react-demo/utils"
)

func main() {
	// 初始化配置
	if err := config.InitConfig(); err != nil {
		log.Fatalf("初始化配置失败: %v", err)
	}

	// 初始化数据库连接
	if err := utils.InitDB(); err != nil {
		log.Fatalf("初始化数据库失败: %v", err)
	}

	log.Println("开始VIP数据迁移...")

	// 获取所有VIP用户
	var users []model.User
	result := utils.GetDB().Where("is_vip = ?", true).Find(&users)
	if result.Error != nil {
		log.Fatalf("获取VIP用户失败: %v", result.Error)
	}

	log.Printf("找到 %d 个VIP用户，开始迁移...", len(users))

	// 迁移每个VIP用户的信息到VIP记录表
	for _, user := range users {
		log.Printf("迁移用户 %d (%s) 的VIP信息...", user.ID, user.Username)

		// 检查用户是否已经有VIP记录
		var existingRecords []model.VipRecord
		utils.GetDB().Where("user_id = ?", user.ID).Find(&existingRecords)

		if len(existingRecords) == 0 {
			// 如果没有VIP记录，创建新的VIP记录
			if user.VipStartAt != nil && user.VipEndAt != nil {
				record := model.VipRecord{
					UserID:    user.ID,
					PlanID:    1, // 默认套餐ID
					IsActive:  user.IsVip && time.Now().Before(*user.VipEndAt),
					StartAt:   *user.VipStartAt,
					EndAt:     *user.VipEndAt,
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
				}

				if err := utils.GetDB().Create(&record).Error; err != nil {
					log.Printf("迁移用户 %d 的VIP信息失败: %v", user.ID, err)
				} else {
					log.Printf("迁移用户 %d 的VIP信息成功", user.ID)
				}
			}
		} else {
			log.Printf("用户 %d 已经有 %d 条VIP记录，跳过迁移", user.ID, len(existingRecords))
		}
	}

	// 初始化默认VIP套餐
	log.Println("初始化默认VIP套餐...")

	// 检查是否已经有VIP套餐
	var plans []model.VipPlan
	utils.GetDB().Find(&plans)

	if len(plans) == 0 {
		// 创建默认的VIP套餐
		defaultPlans := []model.VipPlan{
			{
				Name:      "月度VIP",
				Price:     19.9,
				Duration:  30,
				Features:  `["无广告体验", "优先客服支持", "每月10GB存储空间", "高级功能解锁"]`,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			{
				Name:      "季度VIP",
				Price:     49.9,
				Duration:  90,
				Features:  `["无广告体验", "优先客服支持", "每月20GB存储空间", "高级功能解锁", "专属徽章展示"]`,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			{
				Name:      "年度VIP",
				Price:     149.9,
				Duration:  365,
				Features:  `["无广告体验", "优先客服支持", "每月50GB存储空间", "高级功能解锁", "专属徽章展示", "专属活动邀请", "免费升级新功能"]`,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		}

		for _, plan := range defaultPlans {
			if err := utils.GetDB().Create(&plan).Error; err != nil {
				log.Printf("创建默认VIP套餐失败: %v", err)
			} else {
				log.Printf("创建默认VIP套餐 %s 成功", plan.Name)
			}
		}
	} else {
		log.Printf("已经有 %d 个VIP套餐，跳过初始化", len(plans))
	}

	log.Println("VIP数据迁移完成！")
}
