package api

import (
	"net/http"
	"strconv"
	"time"

	"go-react-demo/model"
	"go-react-demo/service"

	"github.com/gin-gonic/gin"
)

// VipController VIP控制器
type VipController struct {
	vipService *service.VipService
	userService *service.UserService
}

// NewVipController 创建VIP控制器实例
func NewVipController() *VipController {
	return &VipController{
		vipService: service.NewVipService(),
		userService: service.NewUserService(),
	}
}

// ========== VIP套餐相关 ==========

// GetAllVipPlans 获取所有VIP套餐
func (c *VipController) GetAllVipPlans(ctx *gin.Context) {
	plans, err := c.vipService.GetAllVipPlans()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "获取VIP套餐失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "获取VIP套餐成功",
		Data:    plans,
	})
}

// GetVipPlanByID 根据ID获取VIP套餐
func (c *VipController) GetVipPlanByID(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "无效的套餐ID",
		})
		return
	}

	plan, err := c.vipService.GetVipPlanByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, Response{
			Code:    404,
			Message: "VIP套餐不存在",
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "获取VIP套餐成功",
		Data:    plan,
	})
}

// CreateVipPlanRequest 创建VIP套餐请求结构体
type CreateVipPlanRequest struct {
	Name     string  `json:"name" binding:"required"`
	Price    float64 `json:"price" binding:"required,gt=0"`
	Duration int     `json:"duration" binding:"required,gt=0"`
	Features string  `json:"features" binding:"required"`
}

// CreateVipPlan 创建VIP套餐
func (c *VipController) CreateVipPlan(ctx *gin.Context) {
	var req CreateVipPlanRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "请求参数错误: " + err.Error(),
		})
		return
	}

	plan := &model.VipPlan{
		Name:     req.Name,
		Price:    req.Price,
		Duration: req.Duration,
		Features: req.Features,
	}

	if err := c.vipService.CreateVipPlan(plan); err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "创建VIP套餐失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "创建VIP套餐成功",
		Data:    plan,
	})
}

// ========== VIP记录相关 ==========

// GetUserVipRecords 获取用户所有VIP记录
func (c *VipController) GetUserVipRecords(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "无效的用户ID",
		})
		return
	}

	records, err := c.vipService.GetUserVipRecords(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "获取VIP记录失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "获取VIP记录成功",
		Data:    records,
	})
}

// GetUserActiveVipRecord 获取用户当前激活的VIP记录
func (c *VipController) GetUserActiveVipRecord(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "无效的用户ID",
		})
		return
	}

	record, err := c.vipService.GetUserActiveVipRecord(uint(id))
	if err != nil {
		ctx.JSON(http.StatusOK, Response{
			Code:    200,
			Message: "获取激活VIP记录成功",
			Data:    nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "获取激活VIP记录成功",
		Data:    record,
	})
}

// ========== VIP订单相关 ==========

// GetUserVipOrders 获取用户所有VIP订单
func (c *VipController) GetUserVipOrders(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "无效的用户ID",
		})
		return
	}

	orders, err := c.vipService.GetUserVipOrders(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "获取VIP订单失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "获取VIP订单成功",
		Data:    orders,
	})
}

// CreateVipOrderRequest 创建VIP订单请求结构体
type CreateVipOrderRequest struct {
	PlanID uint `json:"plan_id" binding:"required"`
}

// CreateVipOrder 创建VIP订单
func (c *VipController) CreateVipOrder(ctx *gin.Context) {
	userIDStr := ctx.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "无效的用户ID",
		})
		return
	}

	var req CreateVipOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "请求参数错误: " + err.Error(),
		})
		return
	}

	// 获取套餐信息
	plan, err := c.vipService.GetVipPlanByID(req.PlanID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "无效的套餐ID: " + err.Error(),
		})
		return
	}

	// 创建订单
	order := &model.VipOrder{
		UserID:    uint(userID),
		PlanID:    req.PlanID,
		OrderNo:   "VIP" + strconv.FormatUint(uint64(time.Now().UnixNano()), 10),
		Amount:    plan.Price,
		Status:    "pending",
		PayMethod: "",
	}

	if err := c.vipService.CreateVipOrder(order); err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "创建VIP订单失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "创建VIP订单成功",
		Data:    order,
	})
}

// ========== VIP状态同步 ==========

// SyncUserVipStatus 同步用户VIP状态
func (c *VipController) SyncUserVipStatus(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "无效的用户ID",
		})
		return
	}

	if err := c.vipService.SyncUserVipStatus(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "同步VIP状态失败: " + err.Error(),
		})
		return
	}

	// 获取更新后的用户信息
	user, err := c.userService.GetUserVipStatus(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "获取用户信息失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "同步VIP状态成功",
		Data:    user,
	})
}
