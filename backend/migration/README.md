# VIP数据迁移说明

## 概述

本脚本用于将现有的用户VIP信息迁移到新的VIP记录表中，并初始化默认的VIP套餐。

## 迁移内容

1. 将用户表中所有VIP用户的信息迁移到VIP记录表
2. 初始化默认的VIP套餐

## 执行步骤

1. 确保后端服务已经停止
2. 进入backend目录
3. 运行迁移脚本

```bash
cd /Users/admin/Documents/SuperAI_WebProject/backend

go run migration/vip_migration.go
```

## 迁移后的数据结构

### 用户表 (users)
- 保留字段：`is_vip`, `vip_start_at`, `vip_end_at`
- `is_vip`字段会与VIP记录表保持同步

### VIP记录表 (vip_records)
- 存储用户的VIP记录
- 包含字段：id, user_id, plan_id, is_active, start_at, end_at, created_at, updated_at

### VIP套餐表 (vip_plans)
- 存储VIP套餐信息
- 包含字段：id, name, price, duration, features, created_at, updated_at

### VIP订单表 (vip_orders)
- 存储VIP购买订单
- 包含字段：id, user_id, plan_id, order_no, amount, status, pay_method, created_at, updated_at

## 注意事项

1. 迁移脚本只会迁移没有VIP记录的用户
2. 迁移过程中不会删除任何现有数据
3. 迁移脚本会自动创建默认的VIP套餐
4. 迁移完成后，建议验证数据是否正确

## 验证方法

可以通过以下SQL语句验证迁移是否成功：

```sql
-- 查看所有VIP记录
SELECT * FROM vip_records;

-- 查看所有VIP套餐
SELECT * FROM vip_plans;

-- 查看VIP用户数量
SELECT COUNT(*) FROM users WHERE is_vip = true;

-- 查看VIP记录数量
SELECT COUNT(*) FROM vip_records;
```
