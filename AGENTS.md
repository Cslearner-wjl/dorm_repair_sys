# Repository Guidelines

## Project Structure & Module Organization

This repository contains a dormitory repair management system for course delivery.

- `server/`: Spring Boot 3 backend using Java 17, MyBatis, MySQL, JWT auth, and REST controllers.
- `server/src/main/java/com/dorm/repair/`: application code grouped by `controller`, `service`, `service/impl`, `mapper`, `entity`, `dto`, `vo`, `security`, `config`, `common`, and `util`.
- `server/src/main/resources/mapper/`: MyBatis XML mapper SQL.
- `sql/`: database scripts. Use `init.sql` first, then `demo-data.sql` when demo accounts are needed.
- `docs/`: API, deployment, design, and testing documentation.

## Build, Test, and Development Commands

Run backend commands from `server/`:

```powershell
mvn spring-boot:run   # start API server on port 8080
mvn test              # run Maven/Spring Boot test suite
mvn package           # build the backend jar
```

Initialize the database from the repository root:

```powershell
mysql -uroot -proot --default-character-set=utf8mb4 < sql/init.sql
mysql -uroot -proot --default-character-set=utf8mb4 dorm_repair < sql/demo-data.sql
```

## Coding Style & Naming Conventions

Use Java 17 conventions with 4-space indentation. Keep backend classes in the existing package layout and suffix data objects consistently: `*DTO` for requests, `*VO` for responses, `*Mapper` for MyBatis interfaces, and `*ServiceImpl` for implementations. Keep controller routes under `/api/...` and return `ApiResponse<T>`.

## Testing Guidelines

There is currently no committed `server/src/test` tree. Add backend tests under `server/src/test/java/com/dorm/repair/` and name them `*Test`. Use Spring Boot/JUnit dependencies already provided by `spring-boot-starter-test`. Prioritize tests for service state transitions, role restrictions, validation, and mapper-backed queries. Store manual API test notes or exported collections under `docs/api-tests/`.

## Commit & Pull Request Guidelines

Git history currently uses short subjects such as `feat: implement dorm repair backend and API integration`. Continue with concise Conventional Commit-style messages: `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`, or `chore: ...`.

Pull requests should include a clear summary, test results (`mvn test` or noted reason if skipped), database migration notes when `sql/` changes. Link related issues or course requirements when applicable.

## Security & Configuration Tips

Override local secrets with environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, and `UPLOAD_DIR`. Do not commit generated uploads, real credentials, or machine-specific configuration.
