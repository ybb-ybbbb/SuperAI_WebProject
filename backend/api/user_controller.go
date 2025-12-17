package api

import (
	"net/http"
	"strconv"
	"time"

	"go-react-demo/model"
	"go-react-demo/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// UserController 用户控制器
type UserController struct {
	userService *service.UserService
}

// NewUserController 创建用户控制器实例
func NewUserController() *UserController {
	return &UserController{
		userService: service.NewUserService(),
	}
}

// RegisterRequest 注册请求结构体
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6,max=50"`
	Email    string `json:"email" binding:"required,email"`
}

// LoginRequest 登录请求结构体
type LoginRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password" binding:"required"`
}

// Response 统一响应结构体
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Register 用户注册
func (c *UserController) Register(ctx *gin.Context) {
	var req RegisterRequest

	// 绑定请求参数
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "请求参数错误: " + err.Error(),
		})
		return
	}

	// 检查用户名是否已存在
	_, err := c.userService.GetUserByUsername(req.Username)
	if err == nil {
		ctx.JSON(http.StatusConflict, Response{
			Code:    409,
			Message: "用户名已存在",
		})
		return
	}

	// 检查邮箱是否已存在
	_, err = c.userService.GetUserByEmail(req.Email)
	if err == nil {
		ctx.JSON(http.StatusConflict, Response{
			Code:    409,
			Message: "邮箱已存在",
		})
		return
	}

	// 创建新用户
	user := &model.User{
		Username: req.Username,
		Password: req.Password,
		Email:    req.Email,
	}

	if err := c.userService.CreateUser(user); err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "创建用户失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, Response{
		Code:    201,
		Message: "注册成功",
		Data:    user,
	})
}

// Login 用户登录
func (c *UserController) Login(ctx *gin.Context) {
	var req LoginRequest

	// 绑定请求参数
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "请求参数错误: " + err.Error(),
		})
		return
	}

	var user *model.User
	var err error

	// 根据用户名或邮箱登录
	if req.Username != "" {
		user, err = c.userService.GetUserByUsername(req.Username)
	} else if req.Email != "" {
		user, err = c.userService.GetUserByEmail(req.Email)
	} else {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "请提供用户名或邮箱",
		})
		return
	}

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusUnauthorized, Response{
				Code:    401,
				Message: "用户名或密码错误",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "登录失败: " + err.Error(),
		})
		return
	}

	// 检查密码是否正确
	if !user.CheckPassword(req.Password) {
		ctx.JSON(http.StatusUnauthorized, Response{
			Code:    401,
			Message: "用户名或密码错误",
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "登录成功",
		Data:    user,
	})
}

// GetUserInfo 获取用户信息
func (c *UserController) GetUserInfo(ctx *gin.Context) {
	// 这里可以添加JWT认证，获取用户ID
	// 暂时直接返回所有用户信息
	users, err := c.userService.GetAllUsers()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "获取用户信息失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "获取用户信息成功",
		Data:    users,
	})
}

// UpdateUserVipRequest 更新VIP请求结构体
type UpdateUserVipRequest struct {
	IsVip      bool      `json:"is_vip" binding:"required"`
	VipStartAt time.Time `json:"vip_start_at"`
	VipEndAt   time.Time `json:"vip_end_at"`
}

// UpdateUserVip 更新用户VIP信息
func (c *UserController) UpdateUserVip(ctx *gin.Context) {
	// 获取用户ID
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "无效的用户ID",
		})
		return
	}

	// 绑定请求参数
	var req UpdateUserVipRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "请求参数错误: " + err.Error(),
		})
		return
	}

	// 更新VIP信息
	err = c.userService.UpdateUserVip(uint(id), req.IsVip, &req.VipStartAt, &req.VipEndAt)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "更新VIP信息失败: " + err.Error(),
		})
		return
	}

	// 获取更新后的VIP状态
	user, err := c.userService.GetUserVipStatus(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "获取VIP信息失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "VIP信息更新成功",
		Data:    user,
	})
}

// GetUserVipStatus 获取用户VIP状态
func (c *UserController) GetUserVipStatus(ctx *gin.Context) {
	// 获取用户ID
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "无效的用户ID",
		})
		return
	}

	// 获取VIP状态
	user, err := c.userService.GetUserVipStatus(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, Response{
				Code:    404,
				Message: "用户不存在",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "获取VIP信息失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "获取VIP信息成功",
		Data:    user,
	})
}

// CheckUserVip 检查用户是否为有效VIP
func (c *UserController) CheckUserVip(ctx *gin.Context) {
	// 获取用户ID
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "无效的用户ID",
		})
		return
	}

	// 检查VIP状态
	isValid, err := c.userService.CheckUserVip(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, Response{
				Code:    404,
				Message: "用户不存在",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "检查VIP状态失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "检查VIP状态成功",
		Data: map[string]interface{}{
			"is_valid_vip": isValid,
		},
	})
}
