# 宿舍报修管理系统

面向课程验收的宿舍报修管理系统，覆盖学生提交报修、管理员审核派单、维修人员处理、学生确认评价、管理员查看统计的主流程。

## 当前状态

- 后端：Spring Boot + MyBatis + MySQL + JWT，主流程接口已实现，`mvn test` 已在 JDK 17 环境下通过。
- 数据库：初始化脚本位于 `sql/init.sql`，演示数据脚本位于 `sql/demo-data.sql`。
- 文档：需求、设计、API、部署说明集中在 `docs/`。

## 目录结构

```text
.
├─ server/                # Spring Boot 后端
├─ sql/                   # 数据库初始化与演示数据
├─ docs/                  # 项目文档、截图、Figma 导出、接口测试材料
├─ TODO.md
└─ README.md
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

## 数据库初始化

```powershell
mysql -uroot -proot --default-character-set=utf8mb4 < sql/init.sql
```

演示账号：

```text
student001 / 123456
admin001 / 123456
repair001 / 123456
```
