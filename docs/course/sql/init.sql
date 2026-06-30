-- =========================================================
-- 宿舍报修管理系统 数据库初始化
-- 适用场景：武汉理工大学宿舍报修管理系统课程验收
-- 说明：本脚本会重建 dorm_repair 数据库及全部表结构。
-- 导入前请确认已有数据可以被覆盖；如需保留，请先备份数据库。
-- 建表完成后请执行 sql/demo-data.sql 导入验收演示数据。
-- =========================================================

DROP DATABASE IF EXISTS dorm_repair;
CREATE DATABASE dorm_repair
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE dorm_repair;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS repair_feedbacks;
DROP TABLE IF EXISTS repair_records;
DROP TABLE IF EXISTS repair_orders;
DROP TABLE IF EXISTS users;

-- =========================================================
-- 用户表
-- =========================================================
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL,
  real_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(20) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uk_users_username (username),
  KEY idx_users_role (role),
  KEY idx_users_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 报修单表
-- =========================================================
CREATE TABLE repair_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(30) NOT NULL,
  student_id BIGINT NOT NULL,
  repairer_id BIGINT NULL,
  dorm_building VARCHAR(50) NOT NULL,
  room_no VARCHAR(30) NOT NULL,
  category VARCHAR(30) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image_urls TEXT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  reject_reason VARCHAR(200) NULL,
  assigned_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uk_repair_orders_order_no (order_no),
  KEY idx_repair_orders_student_id (student_id),
  KEY idx_repair_orders_repairer_id (repairer_id),
  KEY idx_repair_orders_status (status),
  KEY idx_repair_orders_created_at (created_at),
  KEY idx_repair_orders_deleted_at (deleted_at),
  CONSTRAINT fk_repair_orders_student
    FOREIGN KEY (student_id) REFERENCES users (id),
  CONSTRAINT fk_repair_orders_repairer
    FOREIGN KEY (repairer_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 处理记录表
-- =========================================================
CREATE TABLE repair_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  operator_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,
  content VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_repair_records_order_id (order_id),
  KEY idx_repair_records_operator_id (operator_id),
  CONSTRAINT fk_repair_records_order
    FOREIGN KEY (order_id) REFERENCES repair_orders (id),
  CONSTRAINT fk_repair_records_operator
    FOREIGN KEY (operator_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 评价表
-- =========================================================
CREATE TABLE repair_feedbacks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  score INT NOT NULL,
  comment VARCHAR(300) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_repair_feedbacks_order_id (order_id),
  KEY idx_repair_feedbacks_student_id (student_id),
  CONSTRAINT fk_repair_feedbacks_order
    FOREIGN KEY (order_id) REFERENCES repair_orders (id),
  CONSTRAINT fk_repair_feedbacks_student
    FOREIGN KEY (student_id) REFERENCES users (id),
  CONSTRAINT ck_repair_feedbacks_score CHECK (score BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
