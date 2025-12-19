package user

import (
	"context"

	"backend/api/internal/svc"
	"backend/api/internal/types"
	"backend/rpc/pb/rpc"

	"github.com/zeromicro/go-zero/core/logx"
)

type LoginLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewLoginLogic(ctx context.Context, svcCtx *svc.ServiceContext) *LoginLogic {
	return &LoginLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *LoginLogic) Login(req *types.LoginReq) (resp *types.LoginResp, err error) {
	// 调用RPC服务
	rpcResp, err := l.svcCtx.SuperRpcClient.Login(l.ctx, &rpc.LoginReq{
		Username: req.Username,
		Password: req.Password,
		Email:    req.Email,
	})
	if err != nil {
		l.Errorf("调用RPC服务失败: %v", err)
		return nil, err
	}

	// 转换为API响应
	resp = &types.LoginResp{
		BaseResp: types.BaseResp{
			Code:    int(rpcResp.Base.Code),
			Message: rpcResp.Base.Message,
			Success: rpcResp.Base.Success,
		},
	}

	// 只有当登录成功且rpcResp.User不为nil时，才设置用户数据
	if rpcResp.Base.Success && rpcResp.User != nil {
		resp.Data = types.LoginData{
			User: types.User{
				Id:           rpcResp.User.Id,
				Username:     rpcResp.User.Username,
				Email:        rpcResp.User.Email,
				Avatar:       "", // RPC响应中没有Avatar字段，设置为空字符串
				CreatedAt:    rpcResp.User.CreatedAt,
				UpdatedAt:    rpcResp.User.UpdatedAt,
				IsVip:        rpcResp.User.IsVip,
				VipExpiresAt: rpcResp.User.VipExpiresAt,
				AutoRenew:    rpcResp.User.AutoRenew,
			},
			Token: rpcResp.Token,
		}
	}

	return resp, nil
}
