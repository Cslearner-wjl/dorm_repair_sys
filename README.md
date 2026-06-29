# 宿舍报修管理系统

面向课程验收的宿舍报修管理系统，覆盖学生提交报修、管理员审核派单、维修人员处理、学生确认评价、管理员查看统计的主流程。

## 当前状态

- 后端：Spring Boot + MyBatis + MySQL + JWT，主流程接口已实现，`mvn test` 已在 JDK 17 环境下通过。
- 前端：React 19 + TypeScript + Vite，自定义 CSS 样式（无 UI 框架），页面已按模块拆分。
- 数据库：初始化脚本位于 `sql/init.sql`，演示数据脚本位于 `sql/demo-data.sql`。
- 文档：需求、设计、API、部署说明集中在 `docs/`。

## 目录结构

```text
.
├── server/                              # Spring Boot 后端
├── frontend/                            # React 前端
│   └── src/
│       ├── App.tsx                      # 入口：全局状态 + 视图路由 (~110行)
│       ├── pages/                       # 11 个页面组件
│       │   ├── AuthScreen.tsx           #   登录/注册
│       │   ├── StudentHome.tsx          #   学生首页
│       │   ├── RepairCreatePage.tsx     #   创建报修
│       │   ├── RepairListPage.tsx       #   工单列表（学生/管理员/维修员共用）
│       │   ├── TrackingPage.tsx         #   进度跟踪
│       │   ├── RepairDetailPage.tsx     #   工单详情
│       │   ├── AdminHome.tsx            #   管理员首页
│       │   ├── DispatchPage.tsx         #   派单调度
│       │   ├── UserManagementPage.tsx   #   用户管理
│       │   ├── ProfilePage.tsx          #   个人中心
│       │   └── AnnouncementsPage.tsx    #   通知公告
│       ├── components/                  # 20 个可复用 UI 组件
│       │   ├── AppShell.tsx             #   主布局（顶栏 + 导航）
│       │   ├── ToastBar.tsx             #   消息提示
│       │   ├── Modal.tsx                #   通用弹窗
│       │   ├── TextModal.tsx            #   文本输入弹窗
│       │   ├── AssignModal.tsx          #   派单弹窗
│       │   ├── FeedbackModal.tsx        #   评价弹窗
│       │   ├── PanelTitle.tsx           #   面板标题
│       │   ├── StatCard.tsx             #   统计卡片
│       │   ├── DataState.tsx            #   加载/错误/空态
│       │   ├── FilterBar.tsx            #   筛选栏
│       │   ├── Pagination.tsx           #   分页
│       │   ├── StatusBadge.tsx          #   状态徽章
│       │   ├── CategoryPill.tsx         #   分类标签
│       │   ├── MiniFlow.tsx             #   迷你进度条
│       │   ├── Timeline.tsx             #   时间线
│       │   ├── InfoItem.tsx             #   信息条目
│       │   ├── ActionPanel.tsx          #   操作按钮面板
│       │   ├── TrendChart.tsx           #   趋势图
│       │   ├── Distribution.tsx         #   分布饼图
│       │   └── RepairerList.tsx         #   维修员列表
│       ├── hooks/
│       │   └── useAsyncData.ts          # 异步数据加载 Hook
│       ├── api.ts                       # API 客户端与接口封装
│       ├── types.ts                     # TypeScript 类型定义
│       ├── constants.ts                 # 常量与配置
│       ├── utils.ts                     # 工具函数
│       ├── icons.tsx                    # 分类图标映射
│       └── styles.css                   # 全局样式
├── sql/                                 # 数据库初始化与演示数据
├── docs/                                # 项目文档、设计、接口测试材料
└── README.md
```

## 后端启动

```powershell
cd server
mvn spring-boot:run
```

默认连接：

```text
jdbc:mysql://127.0.0.1:3306/dorm_repair
username: root
password: root
```

可通过环境变量覆盖 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD`。

## 前端启动

```powershell
cd frontend
npm install        # 首次运行需安装依赖
npm run dev        # 启动开发服务器（默认 http://localhost:5173）
```

构建生产版本：

```powershell
npm run build      # 输出到 frontend/dist/
npm run preview    # 预览生产构建
```

## 数据库初始化

```powershell
mysql -uroot -proot --default-character-set=utf8mb4 < sql/init.sql
mysql -uroot -proot dorm_repair < sql/demo-data.sql   # 可选：插入演示数据
```

## 演示账号

| 角色 | 账号 | 密码 | 用途 |
| --- | --- | --- | --- |
| 学生 | student001 | 123456 | 提交报修、确认评价 |
| 管理员 | admin001 | 123456 | 审核派单、统计管理 |
| 维修员 | repair001 | 123456 | 处理维修任务 |
