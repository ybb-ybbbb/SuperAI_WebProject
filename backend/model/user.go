package model

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// User 用户模型
type User struct {
	ID                  uint           `gorm:"primarykey" json:"id"`
	Username            string         `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password            string         `gorm:"size:100;not null" json:"-"`
	Email               string         `gorm:"uniqueIndex;size:100;not null" json:"email"`
	IsVip               bool           `gorm:"default:false" json:"is_vip"`
	VipStartAt          *time.Time     `json:"vip_start_at,omitempty"`
	VipEndAt            *time.Time     `json:"vip_end_at,omitempty"`
	
	// AI使用次数
	AIChatCount         int            `gorm:"default:0" json:"ai_chat_count"`         // AI聊天次数
	AIContentCount      int            `gorm:"default:0" json:"ai_content_count"`      // AI内容生成次数
	AIAnalysisCount     int            `gorm:"default:0" json:"ai_analysis_count"`     // AI数据分析次数
	
	// 使用次数重置时间
	AILastResetAt       *time.Time     `json:"ai_last_reset_at,omitempty"`
	
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeSave 保存前钩子，自动哈希密码
func (u *User) BeforeSave(tx *gorm.DB) error {
	// 只有当密码被修改时才重新哈希
	if u.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashedPassword)
	}
	return nil
}

// CheckPassword 检查密码是否正确
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
