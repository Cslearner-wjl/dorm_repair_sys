-- =========================================================
-- 宿舍报修管理系统 验收最终SQL
-- 说明：本脚本会重建 dorm_repair 数据库，并导入完整验收演示数据。
-- 导入前请确认已有数据可以被覆盖；如需保留，请先备份数据库。
-- 账号说明：所有内置演示账号密码均为 123456。
-- 生成内容：基础账号 + 流程演示工单 + 校园宿舍样例数据。
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

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 一、基础演示账号与核心验收流程数据
-- 覆盖状态：PENDING / APPROVED / ASSIGNED / PROCESSING / WAIT_CONFIRM / COMPLETED / REJECTED
-- =========================================================
INSERT INTO users (username, password, real_name, phone, role, status, deleted_at)
VALUES
  ('student001', '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO', '学生演示账号', '13800000001', 'STUDENT', 1, NULL),
  ('admin001', '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO', '管理员演示账号', '13800000002', 'ADMIN', 1, NULL),
  ('repair001', '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO', '维修员演示账号', '13800000003', 'REPAIR', 1, NULL)
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  real_name = VALUES(real_name),
  phone = VALUES(phone),
  role = VALUES(role),
  status = VALUES(status),
  deleted_at = NULL;

SET @student_id = (SELECT id FROM users WHERE username = 'student001');
SET @admin_id = (SELECT id FROM users WHERE username = 'admin001');
SET @repairer_id = (SELECT id FROM users WHERE username = 'repair001');

INSERT INTO repair_orders (
  order_no, student_id, repairer_id, dorm_building, room_no, category, title,
  description, image_urls, contact_phone, status, reject_reason, assigned_at,
  completed_at, created_at
)
VALUES
  (
    'BXDEMO0001', @student_id, NULL, '3号楼', '301', '水电', '洗手池水龙头漏水',
    '洗手池水龙头关闭后仍持续滴水，需要检查阀芯。', NULL, '13800000001',
    'PENDING', NULL, NULL, NULL, '2026-06-28 09:00:00'
  ),
  (
    'BXDEMO0002', @student_id, NULL, '4号楼', '402', '门窗', '宿舍门锁无法反锁',
    '门锁反锁卡住，晚上关门不安全。', NULL, '13800000001',
    'APPROVED', NULL, NULL, NULL, '2026-06-28 09:15:00'
  ),
  (
    'BXDEMO0003', @student_id, @repairer_id, '5号楼', '503', '网络', '宿舍网络频繁断开',
    '网络每隔十分钟断开一次，影响在线课程。', NULL, '13800000001',
    'ASSIGNED', NULL, '2026-06-28 09:40:00', NULL, '2026-06-28 09:30:00'
  ),
  (
    'BXDEMO0004', @student_id, @repairer_id, '6号楼', '604', '家具', '衣柜门合页松动',
    '衣柜门合页松动，开关时有明显晃动。', NULL, '13800000001',
    'PROCESSING', NULL, '2026-06-28 10:10:00', NULL, '2026-06-28 09:55:00'
  ),
  (
    'BXDEMO0005', @student_id, @repairer_id, '2号楼', '205', '水电', '公共洗衣区插座松动',
    '公共洗衣区插座面板松动，存在安全隐患。', NULL, '13800000001',
    'WAIT_CONFIRM', NULL, '2026-06-28 10:20:00', '2026-06-28 11:05:00', '2026-06-28 10:05:00'
  ),
  (
    'BXDEMO0006', @student_id, @repairer_id, '1号楼', '106', '空调', '空调制冷异常',
    '空调开启后无明显制冷效果。', NULL, '13800000001',
    'COMPLETED', NULL, '2026-06-28 10:30:00', '2026-06-28 11:40:00', '2026-06-28 10:15:00'
  ),
  (
    'BXDEMO0007', @student_id, NULL, '3号楼', '307', '其他', '报修信息不完整示例',
    '该工单用于演示管理员驳回。', NULL, '13800000001',
    'REJECTED', '报修信息不完整，请补充具体位置和现象。', NULL, NULL, '2026-06-28 10:25:00'
  );

SET @order_pending = (SELECT id FROM repair_orders WHERE order_no = 'BXDEMO0001');
SET @order_approved = (SELECT id FROM repair_orders WHERE order_no = 'BXDEMO0002');
SET @order_assigned = (SELECT id FROM repair_orders WHERE order_no = 'BXDEMO0003');
SET @order_processing = (SELECT id FROM repair_orders WHERE order_no = 'BXDEMO0004');
SET @order_wait_confirm = (SELECT id FROM repair_orders WHERE order_no = 'BXDEMO0005');
SET @order_completed = (SELECT id FROM repair_orders WHERE order_no = 'BXDEMO0006');
SET @order_rejected = (SELECT id FROM repair_orders WHERE order_no = 'BXDEMO0007');

INSERT INTO repair_records (order_id, operator_id, action, content, created_at)
VALUES
  (@order_pending, @student_id, 'CREATE', '学生提交报修，等待管理员受理', '2026-06-28 09:00:00'),

  (@order_approved, @student_id, 'CREATE', '学生提交报修，等待管理员受理', '2026-06-28 09:15:00'),
  (@order_approved, @admin_id, 'APPROVE', '管理员审核通过，等待派单', '2026-06-28 09:25:00'),

  (@order_assigned, @student_id, 'CREATE', '学生提交报修，等待管理员受理', '2026-06-28 09:30:00'),
  (@order_assigned, @admin_id, 'APPROVE', '管理员审核通过', '2026-06-28 09:35:00'),
  (@order_assigned, @admin_id, 'ASSIGN', '管理员派单给维修员演示账号', '2026-06-28 09:40:00'),

  (@order_processing, @student_id, 'CREATE', '学生提交报修，等待管理员受理', '2026-06-28 09:55:00'),
  (@order_processing, @admin_id, 'APPROVE', '管理员审核通过', '2026-06-28 10:00:00'),
  (@order_processing, @admin_id, 'ASSIGN', '管理员派单给维修员演示账号', '2026-06-28 10:10:00'),
  (@order_processing, @repairer_id, 'START', '维修员开始处理工单', '2026-06-28 10:25:00'),

  (@order_wait_confirm, @student_id, 'CREATE', '学生提交报修，等待管理员受理', '2026-06-28 10:05:00'),
  (@order_wait_confirm, @admin_id, 'APPROVE', '管理员审核通过', '2026-06-28 10:12:00'),
  (@order_wait_confirm, @admin_id, 'ASSIGN', '管理员派单给维修员演示账号', '2026-06-28 10:20:00'),
  (@order_wait_confirm, @repairer_id, 'START', '维修员开始处理工单', '2026-06-28 10:35:00'),
  (@order_wait_confirm, @repairer_id, 'FINISH', '维修员提交完成，等待学生确认', '2026-06-28 11:05:00'),

  (@order_completed, @student_id, 'CREATE', '学生提交报修，等待管理员受理', '2026-06-28 10:15:00'),
  (@order_completed, @admin_id, 'APPROVE', '管理员审核通过', '2026-06-28 10:22:00'),
  (@order_completed, @admin_id, 'ASSIGN', '管理员派单给维修员演示账号', '2026-06-28 10:30:00'),
  (@order_completed, @repairer_id, 'START', '维修员开始处理工单', '2026-06-28 10:55:00'),
  (@order_completed, @repairer_id, 'FINISH', '维修员完成维修，等待学生确认', '2026-06-28 11:40:00'),
  (@order_completed, @student_id, 'CONFIRM', '学生确认维修完成', '2026-06-28 11:50:00'),
  (@order_completed, @student_id, 'FEEDBACK', '学生提交评价，评分：5', '2026-06-28 11:55:00'),

  (@order_rejected, @student_id, 'CREATE', '学生提交报修，等待管理员受理', '2026-06-28 10:25:00'),
  (@order_rejected, @admin_id, 'REJECT', '管理员驳回：报修信息不完整，请补充具体位置和现象。', '2026-06-28 10:35:00');

INSERT INTO repair_feedbacks (order_id, student_id, score, comment, created_at)
VALUES
  (@order_completed, @student_id, 5, '维修及时，处理结果满意。', '2026-06-28 11:55:00');

-- =========================================================
-- 二、校园宿舍样例数据
-- 覆盖智园10舍611等宿舍场景，并补充多学生、多维修员、多状态数据。
-- =========================================================
-- 随机校园宿舍样例数据。
-- 说明：
-- 1. 本脚本只清理并重建 BXSAMPLE 开头的工单、sample_ 开头的样例用户。
-- 2. 不会删除 student001/admin001/repair001 等基础演示账号。
-- 3. users 表没有宿舍字段，因此脚本用临时表表达“学生-宿舍-宿舍号”关系，
--    再据此生成用户和报修工单。
-- 4. 所有样例账号密码均为 123456。

SET @demo_password = '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO';

DELETE rf
FROM repair_feedbacks rf
JOIN repair_orders ro ON ro.id = rf.order_id
WHERE ro.order_no LIKE 'BXSAMPLE%';

DELETE rr
FROM repair_records rr
JOIN repair_orders ro ON ro.id = rr.order_id
WHERE ro.order_no LIKE 'BXSAMPLE%';

DELETE FROM repair_orders
WHERE order_no LIKE 'BXSAMPLE%';

DELETE FROM users
WHERE username LIKE 'sample_stu_%'
   OR username LIKE 'sample_repair_%';

DROP TABLE IF EXISTS tmp_sample_residents;

CREATE TABLE tmp_sample_residents (
  username VARCHAR(50) PRIMARY KEY,
  real_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  dorm_building VARCHAR(50) NOT NULL,
  room_no VARCHAR(30) NOT NULL
);

INSERT INTO tmp_sample_residents (username, real_name, phone, dorm_building, room_no)
VALUES
  -- 智园10舍 611，必须包含 10舍 和 611；该宿舍 4 人。
  ('sample_stu_001', '林书瑶', '13910000001', '智园10舍', '611'),
  ('sample_stu_002', '周亦辰', '13910000002', '智园10舍', '611'),
  ('sample_stu_003', '陈雨桐', '13910000003', '智园10舍', '611'),
  ('sample_stu_004', '许嘉宁', '13910000004', '智园10舍', '611'),

  -- 智园其他宿舍。
  ('sample_stu_005', '王思远', '13910000005', '智园3舍', '118'),
  ('sample_stu_006', '赵明轩', '13910000006', '智园3舍', '118'),
  ('sample_stu_007', '黄若曦', '13910000007', '智园3舍', '118'),
  ('sample_stu_008', '刘子涵', '13910000008', '智园7舍', '305'),
  ('sample_stu_009', '孙浩然', '13910000009', '智园7舍', '305'),

  -- 慧园样例宿舍。
  ('sample_stu_010', '李清扬', '13910000010', '慧园2舍', '220'),
  ('sample_stu_011', '吴佳怡', '13910000011', '慧园2舍', '220'),
  ('sample_stu_012', '郑宇航', '13910000012', '慧园5舍', '409'),
  ('sample_stu_013', '唐诗涵', '13910000013', '慧园5舍', '409'),
  ('sample_stu_014', '郭景行', '13910000014', '慧园5舍', '409'),

  -- 卓园样例宿舍。
  ('sample_stu_015', '何沐阳', '13910000015', '卓园1舍', '101'),
  ('sample_stu_016', '马依诺', '13910000016', '卓园1舍', '101'),
  ('sample_stu_017', '朱星河', '13910000017', '卓园6舍', '620'),
  ('sample_stu_018', '高若琳', '13910000018', '卓园6舍', '620'),
  ('sample_stu_019', '宋嘉禾', '13910000019', '卓园6舍', '620'),
  ('sample_stu_020', '袁知夏', '13910000020', '卓园6舍', '620'),
  ('sample_stu_021', '程安澜', '13910000021', '卓园4舍', '512');

INSERT INTO users (username, password, real_name, phone, role, status, deleted_at)
SELECT username, @demo_password, real_name, phone, 'STUDENT', 1, NULL
FROM tmp_sample_residents;

INSERT INTO users (username, password, real_name, phone, role, status, deleted_at)
VALUES
  ('sample_repair_001', @demo_password, '曹师傅', '13920000001', 'REPAIR', 1, NULL),
  ('sample_repair_002', @demo_password, '邵师傅', '13920000002', 'REPAIR', 1, NULL);

SET @admin_id = (SELECT id FROM users WHERE username = 'admin001');
SET @repair_001_id = (SELECT id FROM users WHERE username = 'repair001');
SET @repair_002_id = (SELECT id FROM users WHERE username = 'sample_repair_001');
SET @repair_003_id = (SELECT id FROM users WHERE username = 'sample_repair_002');

INSERT INTO repair_orders (
  order_no, student_id, repairer_id, dorm_building, room_no, category, title,
  description, image_urls, contact_phone, status, reject_reason, assigned_at,
  completed_at, created_at
)
SELECT 'BXSAMPLE0001', u.id, NULL, r.dorm_building, r.room_no, '水电', '智园10舍611洗手池漏水',
       '洗手池下方水管接口渗水，地面已经有积水。', NULL, r.phone, 'PENDING',
       NULL, NULL, NULL, '2026-06-20 08:15:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_001'
UNION ALL
SELECT 'BXSAMPLE0002', u.id, @repair_001_id, r.dorm_building, r.room_no, '门窗', '宿舍门锁转动卡顿',
       '门锁反锁时需要反复转动，担心晚上无法正常锁门。', NULL, r.phone, 'ASSIGNED',
       NULL, '2026-06-20 10:30:00', NULL, '2026-06-20 09:05:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_005'
UNION ALL
SELECT 'BXSAMPLE0003', u.id, @repair_002_id, r.dorm_building, r.room_no, '网络', '网络频繁断开',
       '晚上上网课时网络每隔几分钟断开一次。', NULL, r.phone, 'PROCESSING',
       NULL, '2026-06-21 13:20:00', NULL, '2026-06-21 12:50:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_008'
UNION ALL
SELECT 'BXSAMPLE0004', u.id, @repair_003_id, r.dorm_building, r.room_no, '家具', '衣柜合页松动',
       '衣柜门开合时明显晃动，需要加固或更换合页。', NULL, r.phone, 'WAIT_CONFIRM',
       NULL, '2026-06-22 09:10:00', '2026-06-22 11:40:00', '2026-06-22 08:35:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_010'
UNION ALL
SELECT 'BXSAMPLE0005', u.id, @repair_001_id, r.dorm_building, r.room_no, '空调', '空调制冷效果差',
       '空调开机半小时后室内温度仍无明显下降。', NULL, r.phone, 'COMPLETED',
       NULL, '2026-06-22 14:00:00', '2026-06-22 16:10:00', '2026-06-22 13:20:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_012'
UNION ALL
SELECT 'BXSAMPLE0006', u.id, NULL, r.dorm_building, r.room_no, '其他', '报修位置描述不清',
       '只填写了设备坏了，没有说明具体位置和故障现象。', NULL, r.phone, 'REJECTED',
       '请补充具体设备位置和故障现象后重新提交。', NULL, NULL, '2026-06-23 09:00:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_015'
UNION ALL
SELECT 'BXSAMPLE0007', u.id, NULL, r.dorm_building, r.room_no, '水电', '阳台灯不亮',
       '阳台灯开关无反应，疑似灯管损坏。', NULL, r.phone, 'APPROVED',
       NULL, NULL, NULL, '2026-06-23 10:45:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_017'
UNION ALL
SELECT 'BXSAMPLE0008', u.id, @repair_002_id, r.dorm_building, r.room_no, '水电', '插座面板松动',
       '桌边插座面板松动，有轻微晃动。', NULL, r.phone, 'NEED_REASSIGN',
       NULL, '2026-06-24 15:00:00', NULL, '2026-06-24 14:20:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_020'
UNION ALL
SELECT 'BXSAMPLE0009', u.id, NULL, r.dorm_building, r.room_no, '门窗', '窗户把手脱落',
       '窗户把手脱落，暂时无法完全关严。', NULL, r.phone, 'CANCELLED',
       NULL, NULL, NULL, '2026-06-25 08:10:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_021'
UNION ALL
SELECT 'BXSAMPLE0010', u.id, @repair_003_id, r.dorm_building, r.room_no, '家具', '床板异响',
       '床板翻身时异响明显，需要检查支撑结构。', NULL, r.phone, 'COMPLETED',
       NULL, '2026-06-25 12:20:00', '2026-06-25 15:10:00', '2026-06-25 11:30:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_004'
UNION ALL
SELECT 'BXSAMPLE0011', u.id, NULL, r.dorm_building, r.room_no, '网络', '无线网信号弱',
       '宿舍内无线网信号不稳定，靠门位置更明显。', NULL, r.phone, 'PENDING',
       NULL, NULL, NULL, '2026-06-26 17:25:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_014'
UNION ALL
SELECT 'BXSAMPLE0012', u.id, @repair_001_id, r.dorm_building, r.room_no, '水电', '卫生间地漏堵塞',
       '洗澡后排水速度很慢，卫生间积水。', NULL, r.phone, 'PROCESSING',
       NULL, '2026-06-27 09:50:00', NULL, '2026-06-27 09:15:00'
FROM tmp_sample_residents r JOIN users u ON u.username = r.username WHERE r.username = 'sample_stu_002';

INSERT INTO repair_records (order_id, operator_id, action, content, created_at)
VALUES
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0001'), (SELECT id FROM users WHERE username = 'sample_stu_001'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-20 08:15:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0002'), (SELECT id FROM users WHERE username = 'sample_stu_005'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-20 09:05:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0002'), @admin_id, 'APPROVE', '管理员审核通过。', '2026-06-20 10:10:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0002'), @admin_id, 'ASSIGN', '派单给维修员演示账号。', '2026-06-20 10:30:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0003'), (SELECT id FROM users WHERE username = 'sample_stu_008'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-21 12:50:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0003'), @admin_id, 'APPROVE', '管理员审核通过。', '2026-06-21 13:05:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0003'), @admin_id, 'ASSIGN', '派单给曹师傅。', '2026-06-21 13:20:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0003'), @repair_002_id, 'START', '维修员开始检查宿舍网络线路和端口。', '2026-06-21 14:00:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0004'), (SELECT id FROM users WHERE username = 'sample_stu_010'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-22 08:35:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0004'), @admin_id, 'APPROVE', '管理员审核通过。', '2026-06-22 08:50:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0004'), @admin_id, 'ASSIGN', '派单给邵师傅。', '2026-06-22 09:10:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0004'), @repair_003_id, 'START', '维修员开始处理衣柜合页。', '2026-06-22 10:20:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0004'), @repair_003_id, 'FINISH', '已加固合页并测试开合正常，等待学生确认。', '2026-06-22 11:40:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0005'), (SELECT id FROM users WHERE username = 'sample_stu_012'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-22 13:20:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0005'), @admin_id, 'APPROVE', '管理员审核通过。', '2026-06-22 13:40:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0005'), @admin_id, 'ASSIGN', '派单给维修员演示账号。', '2026-06-22 14:00:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0005'), @repair_001_id, 'START', '维修员开始检查空调滤网和制冷状态。', '2026-06-22 15:00:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0005'), @repair_001_id, 'FINISH', '已清理滤网并补充检查，制冷恢复正常。', '2026-06-22 16:10:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0005'), (SELECT id FROM users WHERE username = 'sample_stu_012'), 'CONFIRM', '学生确认维修完成。', '2026-06-22 16:30:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0005'), (SELECT id FROM users WHERE username = 'sample_stu_012'), 'FEEDBACK', '学生提交评价，评分：5。', '2026-06-22 16:35:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0006'), (SELECT id FROM users WHERE username = 'sample_stu_015'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-23 09:00:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0006'), @admin_id, 'REJECT', '管理员驳回：请补充具体设备位置和故障现象。', '2026-06-23 09:20:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0007'), (SELECT id FROM users WHERE username = 'sample_stu_017'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-23 10:45:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0007'), @admin_id, 'APPROVE', '管理员审核通过，等待派单。', '2026-06-23 11:10:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0008'), (SELECT id FROM users WHERE username = 'sample_stu_020'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-24 14:20:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0008'), @admin_id, 'APPROVE', '管理员审核通过。', '2026-06-24 14:35:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0008'), @admin_id, 'ASSIGN', '派单给曹师傅。', '2026-06-24 15:00:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0008'), @repair_002_id, 'REASSIGN_REQUEST', '维修员申请重派：需要电工专用工具。', '2026-06-24 16:10:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0009'), (SELECT id FROM users WHERE username = 'sample_stu_021'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-25 08:10:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0009'), (SELECT id FROM users WHERE username = 'sample_stu_021'), 'CANCEL', '学生撤销报修。', '2026-06-25 08:25:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0010'), (SELECT id FROM users WHERE username = 'sample_stu_004'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-25 11:30:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0010'), @admin_id, 'APPROVE', '管理员审核通过。', '2026-06-25 12:00:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0010'), @admin_id, 'ASSIGN', '派单给邵师傅。', '2026-06-25 12:20:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0010'), @repair_003_id, 'START', '维修员开始检查床板支撑结构。', '2026-06-25 13:15:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0010'), @repair_003_id, 'FINISH', '已加固床板支撑，异响消失。', '2026-06-25 15:10:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0010'), (SELECT id FROM users WHERE username = 'sample_stu_004'), 'CONFIRM', '学生确认维修完成。', '2026-06-25 15:40:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0010'), (SELECT id FROM users WHERE username = 'sample_stu_004'), 'FEEDBACK', '学生提交评价，评分：4。', '2026-06-25 15:45:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0011'), (SELECT id FROM users WHERE username = 'sample_stu_014'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-26 17:25:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0012'), (SELECT id FROM users WHERE username = 'sample_stu_002'), 'CREATE', '学生提交报修，等待管理员受理。', '2026-06-27 09:15:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0012'), @admin_id, 'APPROVE', '管理员审核通过。', '2026-06-27 09:35:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0012'), @admin_id, 'ASSIGN', '派单给维修员演示账号。', '2026-06-27 09:50:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0012'), @repair_001_id, 'START', '维修员开始疏通卫生间地漏。', '2026-06-27 10:20:00');

INSERT INTO repair_feedbacks (order_id, student_id, score, comment, created_at)
VALUES
  (
    (SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0005'),
    (SELECT id FROM users WHERE username = 'sample_stu_012'),
    5,
    '维修速度快，空调已经正常制冷。',
    '2026-06-22 16:35:00'
  ),
  (
    (SELECT id FROM repair_orders WHERE order_no = 'BXSAMPLE0010'),
    (SELECT id FROM users WHERE username = 'sample_stu_004'),
    4,
    '处理效果不错，希望后续能更快到场。',
    '2026-06-25 15:45:00'
  );

DROP TABLE IF EXISTS tmp_sample_residents;

-- =========================================================
-- 验收检查参考语句，可在导入后手动执行
-- =========================================================
-- SELECT COUNT(*) AS user_count FROM users;              -- 预计 26
-- SELECT COUNT(*) AS order_count FROM repair_orders;     -- 预计 19
-- SELECT COUNT(*) AS record_count FROM repair_records;   -- 预计 66
-- SELECT COUNT(*) AS feedback_count FROM repair_feedbacks; -- 预计 3
-- SELECT role, COUNT(*) FROM users GROUP BY role;
-- SELECT status, COUNT(*) FROM repair_orders GROUP BY status ORDER BY status;
-- SELECT username, real_name, role FROM users ORDER BY id LIMIT 10;
