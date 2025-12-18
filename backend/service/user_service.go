package service

import (
	"time"

	"go-react-demo/model"
	"go-react-demo/utils"
)

// UserService 用户服务
type UserService struct{}

// NewUserService 创建用户服务实例
func NewUserService() *UserService {
	return &UserService{}
}

// CreateUser 创建用户
func (s *UserService) CreateUser(user *model.User) error {
	return utils.GetDB().Create(user).Error
}

// GetUserByID 根据ID获取用户
func (s *UserService) GetUserByID(id uint) (*model.User, error) {
	var user model.User
	err := utils.GetDB().First(&user, id).Error
	return &user, err
}

// GetUserByUsername 根据用户名获取用户
func (s *UserService) GetUserByUsername(username string) (*model.User, error) {
	var user model.User
	err := utils.GetDB().Where("username = ?", username).First(&user).Error
	return &user, err
}

// GetUserByEmail 根据邮箱获取用户
func (s *UserService) GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	err := utils.GetDB().Where("email = ?", email).First(&user).Error
	return &user, err
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(user *model.User) error {
	return utils.GetDB().Save(user).Error
}

// DeleteUser 删除用户
func (s *UserService) DeleteUser(id uint) error {
	return utils.GetDB().Delete(&model.User{}, id).Error
}

// GetAllUsers 获取所有用户
func (s *UserService) GetAllUsers() ([]model.User, error) {
	var users []model.User
	err := utils.GetDB().Find(&users).Error
	return users, err
}

// UpdateUserVip 更新用户VIP信息
func (s *UserService) UpdateUserVip(id uint, isVip bool, vipStartAt, vipEndAt *time.Time) error {
	vipService := NewVipService()
	
	// 如果是激活VIP，创建VIP记录
	if isVip && vipStartAt != nil && vipEndAt != nil {
		// 先将用户所有VIP记录设置为非激活
		utils.GetDB().Model(&model.VipRecord{}).Where("user_id = ?", id).Update("is_active", false)
		
		// 创建新的VIP记录
		record := &model.VipRecord{
			UserID:   id,
			PlanID:   1, // 默认套餐ID，后续可以根据实际情况修改
			IsActive: true,
			StartAt:  *vipStartAt,
			EndAt:    *vipEndAt,
		}
		return vipService.CreateVipRecord(record)
	} else {
		// 非激活状态，将所有VIP记录设置为非激活，并更新用户表
		utils.GetDB().Model(&model.VipRecord{}).Where("user_id = ?", id).Update("is_active", false)
		return utils.GetDB().Model(&model.User{}).Where("id = ?", id).Updates(map[string]interface{}{
			"is_vip": false,
		}).Error
	}
}

// GetUserVipStatus 获取用户VIP状态
func (s *UserService) GetUserVipStatus(id uint) (*model.User, error) {
	var user model.User
	err := utils.GetDB().Select("id, username, email, is_vip, vip_start_at, vip_end_at").First(&user, id).Error
	return &user, err
}

// CheckUserVip 检查用户是否为有效VIP
func (s *UserService) CheckUserVip(id uint) (bool, error) {
	vipService := NewVipService()
	
	// 尝试获取用户当前激活的VIP记录
	record, err := vipService.GetUserActiveVipRecord(id)
	if err != nil {
		return false, nil
	}
	
	// 如果有激活的VIP记录，则返回true
	return record.IsActive && time.Now().Before(record.EndAt), nil
}

// UpdateUserInfo 更新用户基本信息
func (s *UserService) UpdateUserInfo(id uint, username, email string) error {
	return utils.GetDB().Model(&model.User{}).Where("id = ?", id).Updates(map[string]interface{}{
		"username": username,
		"email":    email,
	}).Error
}

// UpdateUserPassword 更新用户密码
func (s *UserService) UpdateUserPassword(id uint, password string) error {
	// 先获取用户
	user, err := s.GetUserByID(id)
	if err != nil {
		return err
	}

	// 更新密码（会触发BeforeSave钩子自动哈希）
	user.Password = password
	return utils.GetDB().Save(user).Error
}
