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
	return utils.GetDB().Model(&model.User{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_vip":       isVip,
		"vip_start_at": vipStartAt,
		"vip_end_at":   vipEndAt,
	}).Error
}

// GetUserVipStatus 获取用户VIP状态
func (s *UserService) GetUserVipStatus(id uint) (*model.User, error) {
	var user model.User
	err := utils.GetDB().Select("id, username, email, is_vip, vip_start_at, vip_end_at").First(&user, id).Error
	return &user, err
}

// CheckUserVip 检查用户是否为有效VIP
func (s *UserService) CheckUserVip(id uint) (bool, error) {
	var user model.User
	err := utils.GetDB().Select("is_vip, vip_end_at").First(&user, id).Error
	if err != nil {
		return false, err
	}

	// 检查是否为VIP且未过期
	if user.IsVip && user.VipEndAt != nil {
		return time.Now().Before(*user.VipEndAt), nil
	}

	return false, nil
}
