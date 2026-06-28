CREATE DATABASE IF NOT EXISTS dorm_repair
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE dorm_repair;

DROP TABLE IF EXISTS repair_feedbacks;
DROP TABLE IF EXISTS repair_records;
DROP TABLE IF EXISTS repair_orders;
DROP TABLE IF EXISTS users;

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
  status VARCHAR(30) NOT NULL,
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

INSERT INTO users (username, password, real_name, phone, role, status)
VALUES
  ('student001', '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO', '学生演示账号', '13800000001', 'STUDENT', 1),
  ('admin001', '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO', '管理员演示账号', '13800000002', 'ADMIN', 1),
  ('repair001', '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO', '维修员演示账号', '13800000003', 'REPAIR', 1);
