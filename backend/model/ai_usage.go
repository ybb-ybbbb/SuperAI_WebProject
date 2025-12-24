package model

import (
	"time"

	"gorm.io/gorm"
)

// AIUsage AI使用次数模型
type AIUsage struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	UserID      uint           `json:"user_id"`
	UsedCount   int            `gorm:"default:0" json:"used_count"`
	MaxCount    int            `gorm:"default:10" json:"max_count"` // 默认普通用户10次
	ResetAt     time.Time      `json:"reset_at"`
	LastUsedAt  *time.Time     `json:"last_used_at,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 设置表名
func (AIUsage) TableName() string {
	return "ai_usages"
}

// BeforeCreate 创建前钩子
type AIUsageService struct {
	DB *gorm.DB
}

// NewAIUsageService 创建AI使用次数服务
func NewAIUsageService(db *gorm.DB) *AIUsageService {
	return &AIUsageService{DB: db}
}

// GetOrCreateUsage 获取或创建用户AI使用记录
func (s *AIUsageService) GetOrCreateUsage(userID uint) (*AIUsage, error) {
	var usage AIUsage
	result := s.DB.Where("user_id = ?", userID).First(&usage)
	if result.Error == gorm.ErrRecordNotFound {
		// 创建新记录，重置时间为下月1日
		nextMonth := time.Now().AddDate(0, 1, -time.Now().Day()+1)
		nextMonth = time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, nextMonth.Location())
		
		usage = AIUsage{
			UserID:   userID,
			UsedCount: 0,
			MaxCount:  10, // 默认普通用户10次
			ResetAt:   nextMonth,
		}
		
		// 检查用户是否为VIP，调整最大次数
		var user User
		if err := s.DB.Where("id = ?", userID).First(&user).Error; err == nil {
			if user.IsVip {
				usage.MaxCount = 100 // VIP用户100次
			}
		}
		
		if err := s.DB.Create(&usage).Error; err != nil {
			return nil, err
		}
	} else if result.Error != nil {
		return nil, result.Error
	} else {
		// 检查是否需要重置使用次数
		if time.Now().After(usage.ResetAt) {
			// 计算下一个重置时间
			nextMonth := usage.ResetAt.AddDate(0, 1, 0)
			nextMonth = time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, nextMonth.Location())
			
			// 检查用户是否为VIP，调整最大次数
			var user User
			maxCount := 10 // 默认普通用户10次
			if err := s.DB.Where("id = ?", userID).First(&user).Error; err == nil {
				if user.IsVip {
					maxCount = 100 // VIP用户100次
				}
			}
			
			// 重置使用次数
			usage.UsedCount = 0
			usage.MaxCount = maxCount
			usage.ResetAt = nextMonth
			
			if err := s.DB.Save(&usage).Error; err != nil {
				return nil, err
			}
		} else {
			// 检查用户VIP状态是否变化，调整最大次数
			var user User
			if err := s.DB.Where("id = ?", userID).First(&user).Error; err == nil {
				if user.IsVip && usage.MaxCount == 10 {
					// VIP用户，提升到100次
					usage.MaxCount = 100
					if err := s.DB.Save(&usage).Error; err != nil {
						return nil, err
					}
				} else if !user.IsVip && usage.MaxCount == 100 {
					// 非VIP用户，降低到10次
					usage.MaxCount = 10
					if err := s.DB.Save(&usage).Error; err != nil {
						return nil, err
					}
				}
			}
		}
	}
	
	return &usage, nil
}

// IncrementUsage 增加AI使用次数
func (s *AIUsageService) IncrementUsage(userID uint) (*AIUsage, error) {
	usage, err := s.GetOrCreateUsage(userID)
	if err != nil {
		return nil, err
	}
	
	// 检查是否超过最大次数
	if usage.UsedCount >= usage.MaxCount {
		return usage, nil
	}
	
	// 增加使用次数
	usage.UsedCount++
	now := time.Now()
	usage.LastUsedAt = &now
	
	if err := s.DB.Save(usage).Error; err != nil {
		return nil, err
	}
	
	return usage, nil
}

// GetUsage 获取用户AI使用记录
func (s *AIUsageService) GetUsage(userID uint) (*AIUsage, error) {
	return s.GetOrCreateUsage(userID)
}
