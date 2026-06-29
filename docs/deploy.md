# 部署说明

## 环境要求

- JDK 17
- Maven 3.9+
- MySQL 8

## 初始化数据库

在项目根目录执行：

```powershell
mysql -uroot -proot --default-character-set=utf8mb4 < sql/init.sql
```

如需加载更多演示工单：

```powershell
mysql -uroot -proot --default-character-set=utf8mb4 < sql/demo-data.sql
```

## 启动后端

```powershell
cd server
mvn spring-boot:run
```

默认配置在 `server/src/main/resources/application.yml`。可通过以下环境变量覆盖数据库连接：

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRE_MINUTES
```

## 演示账号

```text
学生：student001 / 123456
管理员：admin001 / 123456
维修人员：repair001 / 123456
```

## 常见问题

- Maven 显示 Java 8：确认 `JAVA_HOME` 指向 JDK 17。
- 后端连接数据库失败：确认 MySQL 已启动，且 `dorm_repair` 已通过 `sql/init.sql` 初始化。
