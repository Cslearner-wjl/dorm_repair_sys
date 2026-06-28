USE dorm_repair;

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM repair_feedbacks;
DELETE FROM repair_records;
DELETE FROM repair_orders;
SET FOREIGN_KEY_CHECKS = 1;

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
