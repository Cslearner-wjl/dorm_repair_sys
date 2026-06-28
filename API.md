# 宿舍报修系统接口文档

## 1. 基础约定

- 后端地址：`http://127.0.0.1:8080`
- 接口前缀：`/api`
- 请求体：`Content-Type: application/json; charset=utf-8`
- 登录后请求头：`Authorization: Bearer <token>`
- 统一返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

分页返回：

```json
{
  "page": 1,
  "pageSize": 10,
  "total": 1,
  "items": []
}
```

## 2. 演示账号

| 角色 | 账号 | 密码 |
| --- | --- | --- |
| 学生 | `student001` | `123456` |
| 管理员 | `admin001` | `123456` |
| 维修员 | `repair001` | `123456` |

## 3. 枚举

用户角色：

| 值 | 含义 |
| --- | --- |
| `STUDENT` | 学生 |
| `ADMIN` | 管理员 |
| `REPAIR` | 维修员 |

报修状态：

| 值 | 含义 |
| --- | --- |
| `PENDING` | 待受理 |
| `APPROVED` | 已受理 |
| `ASSIGNED` | 已派单 |
| `PROCESSING` | 处理中 |
| `WAIT_CONFIRM` | 待确认 |
| `COMPLETED` | 已完成 |
| `REJECTED` | 已驳回 |
| `CANCELLED` | 已撤销 |
| `NEED_REASSIGN` | 需重派 |

## 4. 登录认证

### 登录

`POST /api/auth/login`

```json
{
  "username": "student001",
  "password": "123456"
}
```

返回：

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "student001",
    "realName": "学生演示账号",
    "phone": "13800000001",
    "role": "STUDENT",
    "status": 1
  }
}
```

### 注册

`POST /api/auth/register`

```json
{
  "username": "student002",
  "password": "123456",
  "realName": "学生二",
  "phone": "13800000004"
}
```

### 当前用户

`GET /api/auth/me`

## 5. 用户管理

管理员权限。

### 用户列表

`GET /api/users?page=1&pageSize=10&role=REPAIR&keyword=repair`

### 维修员列表

`GET /api/users/repairers`

### 新增用户

`POST /api/users`

```json
{
  "username": "repair002",
  "password": "123456",
  "realName": "维修员二",
  "phone": "13800000005",
  "role": "REPAIR"
}
```

### 修改用户基础信息

`PUT /api/users/{id}`

```json
{
  "realName": "新姓名",
  "phone": "13800000006"
}
```

### 修改角色

`PUT /api/users/{id}/role`

```json
{
  "role": "REPAIR"
}
```

### 修改状态

`PUT /api/users/{id}/status`

```json
{
  "status": 0
}
```

### 删除用户

`DELETE /api/users/{id}`

## 6. 报修工单

### 学生新增报修

`POST /api/repairs`

```json
{
  "dormBuilding": "3号楼",
  "roomNo": "301",
  "category": "水电",
  "title": "水龙头漏水",
  "description": "洗手池水龙头一直滴水",
  "imageUrls": "image1.jpg",
  "contactPhone": "13800000001"
}
```

### 学生我的报修

`GET /api/repairs/my?page=1&pageSize=10&status=PENDING&category=水电&keyword=水龙头`

### 管理员全部报修

`GET /api/repairs?page=1&pageSize=10&status=PENDING&category=水电&keyword=水龙头`

### 维修员我的任务

`GET /api/repairs/repairer/my?page=1&pageSize=10&status=ASSIGNED`

### 报修详情

`GET /api/repairs/{id}`

详情返回包含：

- 工单基础信息
- `records`：处理记录时间线
- `feedback`：学生评价

### 学生修改待受理报修

`PUT /api/repairs/{id}`

请求体同新增报修。仅报修创建人且状态为 `PENDING` 时允许修改。

### 删除报修

`DELETE /api/repairs/{id}`

- 学生可删除自己的 `PENDING / CANCELLED / REJECTED` 工单。
- 管理员可软删除工单。

### 学生撤销报修

`POST /api/repairs/{id}/cancel`

状态：`PENDING -> CANCELLED`

### 管理员审核通过

`POST /api/repairs/{id}/approve`

状态：`PENDING -> APPROVED`

### 管理员驳回

`POST /api/repairs/{id}/reject`

```json
{
  "reason": "信息不完整"
}
```

状态：`PENDING -> REJECTED`

### 管理员派单

`POST /api/repairs/{id}/assign`

```json
{
  "repairerId": 3,
  "remark": "分配给维修员处理"
}
```

状态：`APPROVED/NEED_REASSIGN -> ASSIGNED`

### 维修员开始维修

`POST /api/repairs/{id}/start`

状态：`ASSIGNED -> PROCESSING`

### 维修员完成维修

`POST /api/repairs/{id}/finish`

```json
{
  "content": "已更换水龙头阀芯并测试正常",
  "imageUrls": "finish1.jpg"
}
```

状态：`PROCESSING -> WAIT_CONFIRM`

### 维修员申请转派

`POST /api/repairs/{id}/reassign`

```json
{
  "reason": "需要其他维修工具"
}
```

状态：`ASSIGNED/PROCESSING -> NEED_REASSIGN`

### 学生确认完成

`POST /api/repairs/{id}/confirm`

状态：`WAIT_CONFIRM -> COMPLETED`

### 学生评价

`POST /api/repairs/{id}/feedback`

```json
{
  "score": 5,
  "comment": "维修及时，结果满意"
}
```

一张工单只能评价一次。

## 7. 管理员统计

管理员权限。

### 统计概览

`GET /api/statistics/overview`

返回字段：

```json
{
  "totalOrders": 10,
  "pendingOrders": 2,
  "processingOrders": 1,
  "completedOrders": 5,
  "averageScore": 4.8,
  "statusStats": [
    { "name": "PENDING", "count": 2 }
  ],
  "categoryStats": [
    { "name": "水电", "count": 3 }
  ],
  "repairerStats": [
    {
      "repairerId": 3,
      "repairerName": "维修员演示账号",
      "activeCount": 2,
      "completedCount": 5,
      "averageScore": 4.8
    }
  ]
}
```

### 状态分布

`GET /api/statistics/status`

用于画工单状态饼图/柱状图。

```json
[
  { "name": "PENDING", "count": 2 },
  { "name": "COMPLETED", "count": 5 }
]
```

### 分类分布

`GET /api/statistics/categories`

用于分析哪类报修最多，例如水电、门窗、网络。

```json
[
  { "name": "水电", "count": 3 },
  { "name": "网络", "count": 1 }
]
```

### 楼栋分布

`GET /api/statistics/buildings`

用于分析哪个宿舍楼报修量最多，方便宿管安排巡检。

```json
[
  { "name": "3号楼", "count": 4 },
  { "name": "4号楼", "count": 2 }
]
```

### 最近 N 天趋势

`GET /api/statistics/daily?days=7`

用于画折线图。`days` 默认 7，最大 90。

```json
[
  {
    "date": "2026-06-28",
    "createdCount": 7,
    "completedCount": 1
  }
]
```

### 维修员排行

`GET /api/statistics/repairers`

用于维修员工作量排行、评分排行。

```json
[
  {
    "repairerId": 3,
    "repairerName": "维修员演示账号",
    "activeCount": 2,
    "completedCount": 5,
    "averageScore": 4.8
  }
]
```

## 8. 图片上传

登录后可调用，学生、管理员、维修员都可以上传图片。

### 上传报修图片

`POST /api/uploads/images`

请求类型：`multipart/form-data`

字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `file` | File | 是 | 图片文件，支持 `jpg/jpeg/png/gif/webp` |

限制：

- 默认最大 5MB。
- 只允许图片类型。
- 文件保存到后端 `uploads/yyyyMMdd/` 目录。
- 返回的 `url` 可直接写入报修单的 `imageUrls` 字段。

返回示例：

```json
{
  "fileName": "uuid.jpg",
  "url": "/uploads/20260628/uuid.jpg",
  "size": 1024
}
```

浏览器访问：

```text
http://127.0.0.1:8080/uploads/20260628/uuid.jpg
```

## 9. 演示数据脚本

脚本位置：

```text
sql/demo-data.sql
```

用途：

- 保留/修复三个演示账号。
- 清空报修单、处理记录、评价。
- 重建覆盖多个状态的演示工单。
- 适合答辩前恢复一个干净可演示的数据环境。

执行命令：

```powershell
cmd /c "mysql -uroot -proot --default-character-set=utf8mb4 < ""D:\软件设计大作业\大作业\sql\demo-data.sql"""
```

脚本会生成这些状态的工单：

- `PENDING`
- `APPROVED`
- `ASSIGNED`
- `PROCESSING`
- `WAIT_CONFIRM`
- `COMPLETED`
- `REJECTED`

## 10. 前端联调说明

静态前端目录：`frontend-prototype`

推荐启动方式：

```powershell
cd D:\软件设计大作业\大作业\frontend-prototype
python -m http.server 5173
```

访问：

```text
http://127.0.0.1:5173
```

前端默认 API 地址：

```text
http://127.0.0.1:8080/api
```

如需修改：

```js
localStorage.setItem("dormRepairApiBase", "http://127.0.0.1:8080/api")
```
