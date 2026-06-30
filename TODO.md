# 宿舍报修管理系统 TODO

> 更新时间：2026-06-29 17:30
> 更新依据：本次静态审查 + `mvn test` + `npm run build` + 新增后端单元测试 + 既有 `docs/api-tests/` 接口测试材料 + `docs/项目完成情况.md`。
> 勾选口径：`[x]` 表示已实现并能从代码、构建结果或测试材料中确认；`[ ]` 表示未完成、未复测或缺少验收材料。

## 0. 当前验收结论

系统已进入 **验收前收尾阶段**。后端主流程、数据库脚本、前端页面和接口调用都已经具备，前端不再是“待开发”状态。

按课程完整验收口径估算：

- **核心系统可演示度：约 90% - 92%**。登录、报修、审核、派单、维修、确认、评价、统计、用户管理、图片上传接口均已实现或接入，公开注册权限风险已修复。
- **完整提交包就绪度：约 90% - 95%**。前端流程截图、数据库截图、测试截图和课程报告已基本补齐，主要差距在最终联调复测记录和可选的图片上传实测材料。
- 补齐最终联调记录后，整体可提升到 **95% 左右**，剩余 P2 可作为答辩时的优化项说明。

当前最重要的结论：

- [x] 后端 Spring Boot + MyBatis + MySQL + JWT 主流程接口已实现。
- [x] 前端 React + Vite 已实现，且通过 Axios 连接真实后端 API。
- [x] `frontend` 执行 `npm run build` 成功。
- [x] `server` 执行 `mvn test` 成功，已运行 11 个后端单元测试。
- [x] 后端已新增 `server/src/test` 测试源码，覆盖公开注册权限、角色限制、状态流转和手机号校验。
- [x] 既有 curl/API 测试结果已保存到 `docs/api-tests/`。
- [ ] 本次未重新跑本机 MySQL 端到端接口联调，需要验收前复测一次。
- [x] 课程报告 Markdown 初稿已生成：`docs/课程报告.md`。
- [x] 前端流程截图、数据库截图和测试命令截图已整理到 `docs/screenshots/`，并已写入课程报告。

## 1. 本次审查发现的 P0 问题

以下项会直接影响“完整验收”或代码提交质量，建议先修。

- [x] **公开注册权限漏洞**：已修复。公开注册现在只允许学生账号；请求体传 `role=REPAIR` 或 `role=ADMIN` 会返回业务错误，未传 `role` 时强制创建 `STUDENT`。已由 `AuthServiceImplTest` 覆盖。

- [x] **默认数据库密码疑似真实本机密码**：`server/src/main/resources/application.yml` 曾出现非示例默认 `DB_PASSWORD`，不符合“不提交真实凭据”的要求，且 README/deploy 文档写的是 `root`。
  已处理：默认值已恢复为 `${DB_PASSWORD:root}`，真实本机密码未纳入提交。

- [x] **最终验收截图主体材料已补齐**：前端主流程截图、数据库截图、`mvn test` 成功截图和 `npm run build` 成功截图已整理到 `docs/screenshots/` 并写入课程报告；权限拦截图和移动端截图本次提交不作为必需材料。

- [x] **课程报告已生成**：`docs/课程报告.md` 已按任务书包含封面、目录、正文、总结、参考文献、附录和评分表；正式提交前仍需填写个人信息并插入最终截图。

- [ ] **最终端到端复测未完成**：验收前需要重新执行 `sql/init.sql`、`sql/demo-data.sql`、启动后端和前端，用三个演示账号完整跑一遍主流程，并保存复测记录。

## 2. P1 验收前建议处理

- [x] `RepairCreateDTO.contactPhone` 已补手机号格式 `@Pattern`；`RepairUpdateDTO` 继承后同步生效。
- [x] `repair_orders.status` 已在 `sql/init.sql` 中补 `DEFAULT 'PENDING'`。
- [x] 已增加 11 个后端自动化测试：公开注册只能学生、学生不可访问管理员工单列表、完整状态流转、已完成工单不可再次派单、非创建学生不可确认、非分配维修人员不可处理、报修手机号校验。
- [x] 统一“HTTP 状态码 vs JSON code”说明：`docs/API.md` 和 `docs/api-tests/INDEX.md` 已明确当前异常统一 HTTP 200，业务码放在 `ApiResponse.code`。
- [x] 前端注册模式已隐藏演示账号切换，并显示“公开注册仅面向学生账号”；手机号输入也增加了前端格式约束。
- [ ] 图片上传已接入前端和后端，但需要验收前实测上传、静态访问 `/uploads/...`、报修单保存 `imageUrls`。
- [x] `docs/API.md` 中 demo-data 执行命令已改成当前仓库相对命令。
- [x] 文档清单已按当前仓库实际情况更新，课程任务书归档到 `docs/course/`，设计材料归档到 `docs/design/`。
- [x] README 已补前端启动/构建命令、`VITE_API_BASE_URL`、CORS 配置说明和完成情况文档入口。

## 3. 已完成模块清单

### 3.1 后端

- [x] Spring Boot 3 + Java 17 配置。
- [x] MyBatis + MySQL 数据访问。
- [x] JWT 登录鉴权。
- [x] `@RequireRole` 角色权限校验。
- [x] 统一响应 `ApiResponse<T>`。
- [x] 统一异常处理。
- [x] 用户注册、登录、当前用户。
- [x] 管理员用户管理：创建、列表、维修人员列表、修改信息、修改角色、启用/禁用、软删除。
- [x] 学生报修：创建、我的报修、详情、修改待受理工单、撤销、删除允许范围内的工单。
- [x] 管理员工单：全部列表、审核、驳回、派单、删除。
- [x] 维修人员工单：我的任务、开始处理、提交完成、申请重派。
- [x] 学生确认完成和评价。
- [x] 处理记录时间线。
- [x] 管理员统计：概览、状态、类型、楼栋、最近 N 天、维修人员统计。
- [x] 图片上传接口 `/api/uploads/images`。
- [x] CORS 配置和上传静态资源映射。
- [x] 后端单元测试：公开注册权限、角色限制、状态流转、手机号校验共 11 个用例。

### 3.2 前端

- [x] Vite + React + TypeScript 项目已存在于 `frontend/`。
- [x] Axios API 封装已接入后端接口。
- [x] JWT token 本地保存和请求拦截已实现。
- [x] 登录/注册界面。
- [x] 学生首页、提交报修、我的报修、详情、确认评价。
- [x] 管理员首页、工单管理、派单、统计、用户管理。
- [x] 维修人员任务列表、详情处理、完成、申请转派。
- [x] 图片上传控件已接入上传接口。
- [x] `npm run build` 已通过。
- [x] 注册模式已明确只面向学生账号，并隐藏演示账号切换。
- [x] 前端主流程页面截图已整理到 `docs/screenshots/`，覆盖学生提交、管理员派单、维修人员处理和学生评价闭环。
- [x] 数据库截图和测试命令截图已整理到 `docs/screenshots/` 并写入课程报告。
- [ ] 图片上传成功页为可选补充材料，本次课程报告未作为必需截图。

### 3.3 数据库与脚本

- [x] `sql/init.sql` 建库建表。
- [x] `users`、`repair_orders`、`repair_records`、`repair_feedbacks` 表。
- [x] 外键、唯一索引、普通索引。
- [x] 三类演示账号。
- [x] `sql/demo-data.sql` 覆盖全部 9 种状态的工单和处理记录。
- [x] `repair_orders.status` 默认值已补。
- [x] 已补充数据库用户、工单、处理记录和评价数据截图。

### 3.4 文档与测试材料

- [x] `README.md`。
- [x] `docs/API.md`。
- [x] `docs/deploy.md`。
- [x] `docs/项目完成情况.md`。
- [x] `docs/需求文档.md`。
- [x] `docs/开发流程.md`。
- [x] `docs/api-tests/` 接口测试 JSON 和索引。
- [x] `docs/design/design-qa.md` 已记录一次视觉 QA 结论。
- [x] 课程报告：`docs/课程报告.md`。
- [x] 后端测试和前端构建截图已整理并写入课程报告。
- [x] 最终数据库截图已整理并写入课程报告。
- [x] 最终前端全流程截图已整理并写入课程报告。

## 4. 验收材料清单

### 4.1 页面截图

- [x] 登录页：`docs/screenshots/login.png`。
- [x] 注册页：`docs/screenshots/register.png`。
- [x] 学生首页桌面截图：`docs/screenshots/student-home-desktop.png`。
- [x] 学生提交报修页：`docs/screenshots/student-create.png`。
- [x] 我的报修列表页：`docs/screenshots/my-repairs.png`。
- [x] 报修详情页，含处理记录时间线：`docs/screenshots/repair-detail-pending.png`、`docs/screenshots/repair-timeline-finished.png`。
- [x] 管理员首页/统计页：`docs/screenshots/admin-dashboard.png`。
- [x] 管理员工单审核页：`docs/screenshots/admin-repair-list.png`。
- [x] 管理员派单页：`docs/screenshots/dispatch.png`。
- [x] 维修人员任务页：`docs/screenshots/repairer-task.png`。
- [x] 维修人员提交完成页：`docs/screenshots/repair-finish-dialog.png`。
- [x] 学生确认完成和评价页：`docs/screenshots/feedback.png`。
- [ ] 用户管理页，可选补充。
- [ ] 图片上传成功页，可选补充。
- [ ] 权限拦截或无权限提示页，本次提交不作为必需材料。
- [ ] 移动端关键页面截图，本次提交不作为必需材料。

### 4.2 数据库截图

- [x] `users` 表演示账号数据：`docs/screenshots/db-users.png`。
- [x] `repair_orders` 表多状态工单数据：`docs/screenshots/db-repair-orders.png`。
- [x] `repair_records` 时间线数据：`docs/screenshots/db-repair-records.png`。
- [x] `repair_feedbacks` 评价数据：`docs/screenshots/db-feedbacks.png`。
- [ ] 单独的 `DESC` 表结构截图可选补充；当前数据库截图已通过表头展示主要字段。

### 4.3 接口与测试材料

- [x] 登录、注册、权限、异常、状态流转、统计等接口 JSON 结果已保存。
- [x] 补充公开注册不能注册维修人员的测试结果：`AuthServiceImplTest.publicRegisterRejectsRepairRole`。
- [ ] 补充图片上传接口测试结果。
- [x] 已补 `mvn test` 和 `npm run build` 成功截图：`docs/screenshots/backend-mvn-test.png`、`docs/screenshots/frontend-npm-build.png`。
- [ ] 最终回归文字记录可选补充：命令、时间、环境、结果。
- [x] 已补自动化测试，不再需要以“无自动化测试”为报告说明口径。

## 5. 当前最高优先级

1. 核对课程报告封面个人信息、班级、学号和指导教师。
2. 演示前重新初始化数据库，启动后端和前端，跑一遍主流程。
3. 可选补充图片上传接口、静态访问 `/uploads/...` 和报修单 `imageUrls` 保存截图。
4. 可选补充最终回归文字记录：命令、时间、环境、结果。

## 6. Bug 与风险记录

| 日期 | 问题 | 严重程度 | 处理状态 |
| --- | --- | --- | --- |
| 2026-06-29 | 公开注册可通过请求体传 `role=REPAIR` 创建维修人员账号 | P0 | 已修复并补测试 |
| 2026-06-29 | `application.yml` 默认数据库密码疑似真实本机密码，且与 README 不一致 | P0 | 已修复 |
| 2026-06-29 | 后端没有测试源码，`mvn test` 结果为 `No tests to run` | P1 | 已补 11 个单元测试 |
| 2026-06-29 | 报修联系电话缺少手机号格式校验 | P1 | 已修复并补测试 |
| 2026-06-29 | TODO/文档旧状态仍写前端待开发、部分文档归档路径不准确 | P1 | 已同步 README、API、部署、需求文档和完成情况文档 |
| 2026-06-28 | `RegisterDTO` 手机号缺少格式校验 | P1 | 已修复 |
| 2026-06-28 | `UserCreateDTO` 手机号缺少格式校验 | P1 | 已修复 |
| 2026-06-28 | `UserUpdateDTO` 手机号缺少格式校验 | P1 | 已修复 |

## 7. P2 扩展项

P0/P1 完成前不要优先扩展。

- [ ] 消息通知/公告后端接口。
- [ ] Excel 导出。
- [ ] 报修超时提醒。
- [ ] 操作日志管理。
- [ ] 评价修改或隐藏违规评价。
- [ ] 更复杂的统计图表。
- [ ] 更完整的移动端视觉 QA。

## 8. 最终演示主线

```text
学生登录 -> 提交报修 -> 管理员审核 -> 管理员派单 -> 维修人员处理 -> 维修人员提交完成 -> 学生确认 -> 学生评价 -> 管理员查看统计
```

演示账号：

```text
学生：student001 / 123456
管理员：admin001 / 123456
维修人员：repair001 / 123456
```
