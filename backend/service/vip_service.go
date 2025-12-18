package service

import (
	"time"

	"go-react-demo/model"
	"go-react-demo/utils"
)

// VipService VIP服务
type VipService struct{}

// NewVipService 创建VIP服务实例
func NewVipService() *VipService {
	return &VipService{}
}

// ========== VIP套餐相关 ==========

// CreateVipPlan 创建VIP套餐
func (s *VipService) CreateVipPlan(plan *model.VipPlan) error {
	return utils.GetDB().Create(plan).Error
}

// GetVipPlanByID 根据ID获取VIP套餐
func (s *VipService) GetVipPlanByID(id uint) (*model.VipPlan, error) {
	var plan model.VipPlan
	err := utils.GetDB().First(&plan, id).Error
	return &plan, err
}

// GetAllVipPlans 获取所有VIP套餐
func (s *VipService) GetAllVipPlans() ([]model.VipPlan, error) {
	var plans []model.VipPlan
	err := utils.GetDB().Find(&plans).Error
	return plans, err
}

// UpdateVipPlan 更新VIP套餐
func (s *VipService) UpdateVipPlan(plan *model.VipPlan) error {
	return utils.GetDB().Save(plan).Error
}

// DeleteVipPlan 删除VIP套餐
func (s *VipService) DeleteVipPlan(id uint) error {
	return utils.GetDB().Delete(&model.VipPlan{}, id).Error
}

// ========== VIP记录相关 ==========

// CreateVipRecord 创建VIP记录
func (s *VipService) CreateVipRecord(record *model.VipRecord) error {
	// 开启事务
	tx := utils.GetDB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 创建VIP记录
	if err := tx.Create(record).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 更新用户表中的VIP状态
	isActive := record.IsActive && time.Now().Before(record.EndAt)
	if err := tx.Model(&model.User{}).Where("id = ?", record.UserID).Updates(map[string]interface{}{
		"is_vip":       isActive,
		"vip_start_at": &record.StartAt,
		"vip_end_at":   &record.EndAt,
	}).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// GetUserActiveVipRecord 获取用户当前激活的VIP记录
func (s *VipService) GetUserActiveVipRecord(userID uint) (*model.VipRecord, error) {
	var record model.VipRecord
	err := utils.GetDB().Preload("Plan").Where("user_id = ? AND is_active = ? AND end_at > ?", userID, true, time.Now()).First(&record).Error
	return &record, err
}

// GetUserVipRecords 获取用户所有VIP记录
func (s *VipService) GetUserVipRecords(userID uint) ([]model.VipRecord, error) {
	var records []model.VipRecord
	err := utils.GetDB().Preload("Plan").Where("user_id = ?", userID).Order("created_at DESC").Find(&records).Error
	return records, err
}

// UpdateVipRecord 更新VIP记录
func (s *VipService) UpdateVipRecord(record *model.VipRecord) error {
	return utils.GetDB().Save(record).Error
}

// ========== VIP订单相关 ==========

// CreateVipOrder 创建VIP订单
func (s *VipService) CreateVipOrder(order *model.VipOrder) error {
	return utils.GetDB().Create(order).Error
}

// GetVipOrderByID 根据ID获取VIP订单
func (s *VipService) GetVipOrderByID(id uint) (*model.VipOrder, error) {
	var order model.VipOrder
	err := utils.GetDB().Preload("Plan").First(&order, id).Error
	return &order, err
}

// GetVipOrderByOrderNo 根据订单号获取VIP订单
func (s *VipService) GetVipOrderByOrderNo(orderNo string) (*model.VipOrder, error) {
	var order model.VipOrder
	err := utils.GetDB().Preload("Plan").Where("order_no = ?", orderNo).First(&order).Error
	return &order, err
}

// GetUserVipOrders 获取用户所有VIP订单
func (s *VipService) GetUserVipOrders(userID uint) ([]model.VipOrder, error) {
	var orders []model.VipOrder
	err := utils.GetDB().Preload("Plan").Where("user_id = ?", userID).Order("created_at DESC").Find(&orders).Error
	return orders, err
}

// UpdateVipOrderStatus 更新VIP订单状态
func (s *VipService) UpdateVipOrderStatus(id uint, status string) error {
	return utils.GetDB().Model(&model.VipOrder{}).Where("id = ?", id).Update("status", status).Error
}

// ========== VIP状态同步 ==========

// SyncUserVipStatus 同步用户VIP状态
func (s *VipService) SyncUserVipStatus(userID uint) error {
	// 获取用户当前激活的VIP记录
	record, err := s.GetUserActiveVipRecord(userID)
	if err != nil {
		// 如果没有激活的VIP记录，将用户VIP状态设置为false
		return utils.GetDB().Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
			"is_vip": false,
		}).Error
	}

	// 更新用户表中的VIP状态
	return utils.GetDB().Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"is_vip":       true,
		"vip_start_at": &record.StartAt,
		"vip_end_at":   &record.EndAt,
	}).Error
}
