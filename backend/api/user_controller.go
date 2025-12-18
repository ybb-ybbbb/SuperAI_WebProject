package api

import (
	"net/http"
	"strconv"
	"time"

	"go-react-demo/model"
	"go-react-demo/service"
	"go-react-demo/utils"

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

	// 生成JWT Token
	token, err := utils.GenerateToken(user.ID, user.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "生成Token失败: " + err.Error(),
		})
		return
	}

	// 返回用户信息和Token
	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "登录成功",
		Data: map[string]interface{}{
			"user":  user,
			"token": token,
		},
	})
}

// GetUserInfo 获取当前用户信息
func (c *UserController) GetUserInfo(ctx *gin.Context) {
	// 这里应该从JWT Token中获取当前用户ID
	// 暂时直接返回第一个用户，后续需要添加JWT认证
	users, err := c.userService.GetAllUsers()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "获取用户信息失败: " + err.Error(),
		})
		return
	}

	// 暂时返回第一个用户，后续需要根据JWT Token获取当前用户
	var user *model.User
	if len(users) > 0 {
		user = &users[0]
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "获取用户信息成功",
		Data:    user,
	})
}

// GetUsers 获取所有用户信息
func (c *UserController) GetUsers(ctx *gin.Context) {
	// 获取所有用户信息
	users, err := c.userService.GetAllUsers()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "获取用户列表失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "获取用户列表成功",
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

// UpdateUserInfoRequest 更新用户信息请求结构体
type UpdateUserInfoRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
}

// UpdateUserPasswordRequest 更新密码请求结构体
type UpdateUserPasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6,max=50"`
}

// GetUser 获取单个用户信息
func (c *UserController) GetUser(ctx *gin.Context) {
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

	// 获取用户信息
	user, err := c.userService.GetUserByID(uint(id))
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
			Message: "获取用户信息失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "获取用户信息成功",
		Data:    user,
	})
}

// UpdateUserInfo 更新用户基本信息
func (c *UserController) UpdateUserInfo(ctx *gin.Context) {
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
	var req UpdateUserInfoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "请求参数错误: " + err.Error(),
		})
		return
	}

	// 更新用户信息
	if err := c.userService.UpdateUserInfo(uint(id), req.Username, req.Email); err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "更新用户信息失败: " + err.Error(),
		})
		return
	}

	// 获取更新后的用户信息
	user, err := c.userService.GetUserByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "获取更新后的用户信息失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "更新用户信息成功",
		Data:    user,
	})
}

// UpdateUserPassword 更新用户密码
func (c *UserController) UpdateUserPassword(ctx *gin.Context) {
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
	var req UpdateUserPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, Response{
			Code:    400,
			Message: "请求参数错误: " + err.Error(),
		})
		return
	}

	// 验证旧密码
	user, err := c.userService.GetUserByID(uint(id))
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
			Message: "获取用户信息失败: " + err.Error(),
		})
		return
	}

	if !user.CheckPassword(req.OldPassword) {
		ctx.JSON(http.StatusUnauthorized, Response{
			Code:    401,
			Message: "旧密码错误",
		})
		return
	}

	// 更新密码
	if err := c.userService.UpdateUserPassword(uint(id), req.NewPassword); err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "更新密码失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "更新密码成功",
	})
}

// DeleteUser 删除用户
func (c *UserController) DeleteUser(ctx *gin.Context) {
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

	// 检查用户是否存在
	_, err = c.userService.GetUserByID(uint(id))
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
			Message: "检查用户信息失败: " + err.Error(),
		})
		return
	}

	// 删除用户
	if err := c.userService.DeleteUser(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, Response{
			Code:    500,
			Message: "删除用户失败: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, Response{
		Code:    200,
		Message: "删除用户成功",
	})
}
