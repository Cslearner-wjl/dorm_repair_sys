-- =========================================================
-- 宿舍报修管理系统 验收演示数据
-- 适用场景：武汉理工大学宿舍报修管理系统课程验收
-- 前置条件：已执行 sql/init.sql 完成建库建表
-- 说明：本脚本会清空已有数据，插入完整验收业务数据。
-- 账号说明：所有内置账号密码均为 123456。
-- 主要验收学生：吴家乐，武汉理工大学智园10舍611。
-- =========================================================

USE dorm_repair;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM repair_feedbacks;
DELETE FROM repair_records;
DELETE FROM repair_orders;
DELETE FROM users;

-- =========================================================
-- 一、基础账号与吴家乐完整业务流程数据
-- 覆盖状态：PENDING / APPROVED / ASSIGNED / PROCESSING / WAIT_CONFIRM / COMPLETED / REJECTED
-- =========================================================
INSERT INTO users (username, password, real_name, phone, role, status, deleted_at)
VALUES
  ('student001', '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO', '吴家乐', '18171230001', 'STUDENT', 1, NULL),
  ('admin001', '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO', '张敏', '18171230002', 'ADMIN', 1, NULL),
  ('repair001', '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO', '李建国', '18171230003', 'REPAIR', 1, NULL)
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
    'BX202606280001', @student_id, NULL, '武汉理工大学智园10舍', '611', '水电', '智园10舍611洗手池水龙头漏水',
    '武汉理工大学智园10舍611宿舍洗手池水龙头关闭后仍持续滴水，水池周边已经有明显水渍，需要检查阀芯和软管接口。', NULL, '18171230001',
    'PENDING', NULL, NULL, NULL, '2026-06-28 09:00:00'
  ),
  (
    'BX202606280002', @student_id, NULL, '武汉理工大学智园10舍', '611', '门窗', '智园10舍611宿舍门锁无法反锁',
    '宿舍门锁反锁时卡顿明显，夜间关门存在安全隐患，需要检查锁芯。', NULL, '18171230001',
    'APPROVED', NULL, NULL, NULL, '2026-06-28 09:15:00'
  ),
  (
    'BX202606280003', @student_id, @repairer_id, '武汉理工大学智园10舍', '611', '网络', '智园10舍611网络频繁断开',
    '宿舍网络每隔十分钟左右断开一次，影响在线课程和资料提交，需要检查弱电箱端口。', NULL, '18171230001',
    'ASSIGNED', NULL, '2026-06-28 09:40:00', NULL, '2026-06-28 09:30:00'
  ),
  (
    'BX202606280004', @student_id, @repairer_id, '武汉理工大学智园10舍', '611', '家具', '智园10舍611衣柜门合页松动',
    '衣柜门合页松动，开关时晃动明显，担心继续使用会脱落。', NULL, '18171230001',
    'PROCESSING', NULL, '2026-06-28 10:10:00', NULL, '2026-06-28 09:55:00'
  ),
  (
    'BX202606280005', @student_id, @repairer_id, '武汉理工大学智园10舍', '611', '水电', '智园10舍611阳台插座面板松动',
    '阳台洗衣机旁边插座面板松动，插拔插头时有明显晃动，存在用电安全隐患。', NULL, '18171230001',
    'WAIT_CONFIRM', NULL, '2026-06-28 10:20:00', '2026-06-28 11:05:00', '2026-06-28 10:05:00'
  ),
  (
    'BX202606280006', @student_id, @repairer_id, '武汉理工大学智园10舍', '611', '空调', '智园10舍611空调制冷异常',
    '空调开启后出风正常但制冷效果较差，宿舍内温度下降不明显。', NULL, '18171230001',
    'COMPLETED', NULL, '2026-06-28 10:30:00', '2026-06-28 11:40:00', '2026-06-28 10:15:00'
  ),
  (
    'BX202606280007', @student_id, NULL, '武汉理工大学智园10舍', '611', '其他', '智园10舍611设备故障位置待补充',
    '提交时只说明设备有异常，未写清具体设备位置和故障现象。', NULL, '18171230001',
    'REJECTED', '请补充具体设备位置、故障现象和现场照片后重新提交。', NULL, NULL, '2026-06-28 10:25:00'
  );

SET @order_pending = (SELECT id FROM repair_orders WHERE order_no = 'BX202606280001');
SET @order_approved = (SELECT id FROM repair_orders WHERE order_no = 'BX202606280002');
SET @order_assigned = (SELECT id FROM repair_orders WHERE order_no = 'BX202606280003');
SET @order_processing = (SELECT id FROM repair_orders WHERE order_no = 'BX202606280004');
SET @order_wait_confirm = (SELECT id FROM repair_orders WHERE order_no = 'BX202606280005');
SET @order_completed = (SELECT id FROM repair_orders WHERE order_no = 'BX202606280006');
SET @order_rejected = (SELECT id FROM repair_orders WHERE order_no = 'BX202606280007');

INSERT INTO repair_records (order_id, operator_id, action, content, created_at)
VALUES
  (@order_pending, @student_id, 'CREATE', '吴家乐提交报修，等待宿管中心受理。', '2026-06-28 09:00:00'),

  (@order_approved, @student_id, 'CREATE', '吴家乐提交报修，等待宿管中心受理。', '2026-06-28 09:15:00'),
  (@order_approved, @admin_id, 'APPROVE', '张敏审核通过，等待安排维修人员。', '2026-06-28 09:25:00'),

  (@order_assigned, @student_id, 'CREATE', '吴家乐提交报修，等待宿管中心受理。', '2026-06-28 09:30:00'),
  (@order_assigned, @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-28 09:35:00'),
  (@order_assigned, @admin_id, 'ASSIGN', '张敏派单给李建国。', '2026-06-28 09:40:00'),

  (@order_processing, @student_id, 'CREATE', '吴家乐提交报修，等待宿管中心受理。', '2026-06-28 09:55:00'),
  (@order_processing, @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-28 10:00:00'),
  (@order_processing, @admin_id, 'ASSIGN', '张敏派单给李建国。', '2026-06-28 10:10:00'),
  (@order_processing, @repairer_id, 'START', '李建国开始处理衣柜合页松动问题。', '2026-06-28 10:25:00'),

  (@order_wait_confirm, @student_id, 'CREATE', '吴家乐提交报修，等待宿管中心受理。', '2026-06-28 10:05:00'),
  (@order_wait_confirm, @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-28 10:12:00'),
  (@order_wait_confirm, @admin_id, 'ASSIGN', '张敏派单给李建国。', '2026-06-28 10:20:00'),
  (@order_wait_confirm, @repairer_id, 'START', '李建国到达智园10舍611检查插座面板。', '2026-06-28 10:35:00'),
  (@order_wait_confirm, @repairer_id, 'FINISH', '已固定插座面板并检查通电情况，等待吴家乐确认。', '2026-06-28 11:05:00'),

  (@order_completed, @student_id, 'CREATE', '吴家乐提交报修，等待宿管中心受理。', '2026-06-28 10:15:00'),
  (@order_completed, @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-28 10:22:00'),
  (@order_completed, @admin_id, 'ASSIGN', '张敏派单给李建国。', '2026-06-28 10:30:00'),
  (@order_completed, @repairer_id, 'START', '李建国开始检查空调滤网、遥控设置和制冷状态。', '2026-06-28 10:55:00'),
  (@order_completed, @repairer_id, 'FINISH', '已清理空调滤网并完成试运行，制冷恢复正常。', '2026-06-28 11:40:00'),
  (@order_completed, @student_id, 'CONFIRM', '吴家乐确认维修完成。', '2026-06-28 11:50:00'),
  (@order_completed, @student_id, 'FEEDBACK', '吴家乐提交评价，评分：5。', '2026-06-28 11:55:00'),

  (@order_rejected, @student_id, 'CREATE', '吴家乐提交报修，等待宿管中心受理。', '2026-06-28 10:25:00'),
  (@order_rejected, @admin_id, 'REJECT', '张敏驳回：请补充具体设备位置、故障现象和现场照片后重新提交。', '2026-06-28 10:35:00');

INSERT INTO repair_feedbacks (order_id, student_id, score, comment, created_at)
VALUES
  (@order_completed, @student_id, 5, '维修响应及时，空调制冷已经恢复正常，处理结果满意。', '2026-06-28 11:55:00');

-- =========================================================
-- 二、武汉理工大学宿舍业务数据
-- 覆盖智园、慧园、卓园等宿舍楼，并补充多学生、多维修员、多状态数据。
-- =========================================================

SET @default_password = '$2a$10$fy.1cwIwxYjwMDN5feK/C.g4xoiU3lcG0tHUIYi2kE/Z2/Y21j6KO';

DROP TABLE IF EXISTS tmp_residents;

CREATE TABLE tmp_residents (
  username VARCHAR(50) PRIMARY KEY,
  real_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  dorm_building VARCHAR(50) NOT NULL,
  room_no VARCHAR(30) NOT NULL
);

INSERT INTO tmp_residents (username, real_name, phone, dorm_building, room_no)
VALUES
  -- 智园10舍611，吴家乐同宿舍成员。
  ('stu_001', '林书瑶', '18171230101', '武汉理工大学智园10舍', '611'),
  ('stu_002', '周亦辰', '18171230102', '武汉理工大学智园10舍', '611'),
  ('stu_003', '陈雨桐', '18171230103', '武汉理工大学智园10舍', '611'),
  ('stu_004', '许嘉宁', '18171230104', '武汉理工大学智园10舍', '611'),

  -- 智园其他宿舍。
  ('stu_005', '王思远', '18171230105', '武汉理工大学智园3舍', '118'),
  ('stu_006', '赵明轩', '18171230106', '武汉理工大学智园3舍', '118'),
  ('stu_007', '黄若曦', '18171230107', '武汉理工大学智园3舍', '118'),
  ('stu_008', '刘子涵', '18171230108', '武汉理工大学智园7舍', '305'),
  ('stu_009', '孙浩然', '18171230109', '武汉理工大学智园7舍', '305'),

  -- 慧园宿舍。
  ('stu_010', '李清扬', '18171230110', '武汉理工大学慧园2舍', '220'),
  ('stu_011', '吴佳怡', '18171230111', '武汉理工大学慧园2舍', '220'),
  ('stu_012', '郑宇航', '18171230112', '武汉理工大学慧园5舍', '409'),
  ('stu_013', '唐诗涵', '18171230113', '武汉理工大学慧园5舍', '409'),
  ('stu_014', '郭景行', '18171230114', '武汉理工大学慧园5舍', '409'),

  -- 卓园宿舍。
  ('stu_015', '何沐阳', '18171230115', '武汉理工大学卓园1舍', '101'),
  ('stu_016', '马依诺', '18171230116', '武汉理工大学卓园1舍', '101'),
  ('stu_017', '朱星河', '18171230117', '武汉理工大学卓园6舍', '620'),
  ('stu_018', '高若琳', '18171230118', '武汉理工大学卓园6舍', '620'),
  ('stu_019', '宋嘉禾', '18171230119', '武汉理工大学卓园6舍', '620'),
  ('stu_020', '袁知夏', '18171230120', '武汉理工大学卓园6舍', '620'),
  ('stu_021', '程安澜', '18171230121', '武汉理工大学卓园4舍', '512');

INSERT INTO users (username, password, real_name, phone, role, status, deleted_at)
SELECT username, @default_password, real_name, phone, 'STUDENT', 1, NULL
FROM tmp_residents;

INSERT INTO users (username, password, real_name, phone, role, status, deleted_at)
VALUES
  ('repair002', @default_password, '曹建军', '18171230201', 'REPAIR', 1, NULL),
  ('repair003', @default_password, '邵明远', '18171230202', 'REPAIR', 1, NULL);

SET @admin_id = (SELECT id FROM users WHERE username = 'admin001');
SET @repair_001_id = (SELECT id FROM users WHERE username = 'repair001');
SET @repair_002_id = (SELECT id FROM users WHERE username = 'repair002');
SET @repair_003_id = (SELECT id FROM users WHERE username = 'repair003');

INSERT INTO repair_orders (
  order_no, student_id, repairer_id, dorm_building, room_no, category, title,
  description, image_urls, contact_phone, status, reject_reason, assigned_at,
  completed_at, created_at
)
SELECT 'BX202606200001', u.id, NULL, r.dorm_building, r.room_no, '水电', '智园10舍611洗手池下水管渗水',
       '洗手池下方水管接口渗水，地面已经有积水，需要尽快检查接口密封。', NULL, r.phone, 'PENDING',
       NULL, NULL, NULL, '2026-06-20 08:15:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_001'
UNION ALL
SELECT 'BX202606200002', u.id, @repair_001_id, r.dorm_building, r.room_no, '门窗', '智园3舍118宿舍门锁转动卡顿',
       '门锁反锁时需要反复转动，夜间锁门不方便，需要检查锁芯。', NULL, r.phone, 'ASSIGNED',
       NULL, '2026-06-20 10:30:00', NULL, '2026-06-20 09:05:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_005'
UNION ALL
SELECT 'BX202606210001', u.id, @repair_002_id, r.dorm_building, r.room_no, '网络', '智园7舍305网络频繁断开',
       '晚上上网课时网络每隔几分钟断开一次，需要检查宿舍端口和网线。', NULL, r.phone, 'PROCESSING',
       NULL, '2026-06-21 13:20:00', NULL, '2026-06-21 12:50:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_008'
UNION ALL
SELECT 'BX202606220001', u.id, @repair_003_id, r.dorm_building, r.room_no, '家具', '慧园2舍220衣柜合页松动',
       '衣柜门开合时明显晃动，需要加固或更换合页。', NULL, r.phone, 'WAIT_CONFIRM',
       NULL, '2026-06-22 09:10:00', '2026-06-22 11:40:00', '2026-06-22 08:35:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_010'
UNION ALL
SELECT 'BX202606220002', u.id, @repair_001_id, r.dorm_building, r.room_no, '空调', '慧园5舍409空调制冷效果差',
       '空调开机半小时后室内温度仍无明显下降，需要检查滤网和制冷状态。', NULL, r.phone, 'COMPLETED',
       NULL, '2026-06-22 14:00:00', '2026-06-22 16:10:00', '2026-06-22 13:20:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_012'
UNION ALL
SELECT 'BX202606230001', u.id, NULL, r.dorm_building, r.room_no, '其他', '卓园1舍101故障位置待补充',
       '报修内容只写了设备损坏，未说明具体位置、设备名称和故障现象。', NULL, r.phone, 'REJECTED',
       '请补充具体设备位置、设备名称和故障现象后重新提交。', NULL, NULL, '2026-06-23 09:00:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_015'
UNION ALL
SELECT 'BX202606230002', u.id, NULL, r.dorm_building, r.room_no, '水电', '卓园6舍620阳台灯不亮',
       '阳台灯开关无反应，疑似灯管或线路损坏。', NULL, r.phone, 'APPROVED',
       NULL, NULL, NULL, '2026-06-23 10:45:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_017'
UNION ALL
SELECT 'BX202606240001', u.id, @repair_002_id, r.dorm_building, r.room_no, '水电', '卓园6舍620桌边插座面板松动',
       '桌边插座面板松动，有轻微晃动，需要电工检查并固定。', NULL, r.phone, 'NEED_REASSIGN',
       NULL, '2026-06-24 15:00:00', NULL, '2026-06-24 14:20:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_020'
UNION ALL
SELECT 'BX202606250001', u.id, NULL, r.dorm_building, r.room_no, '门窗', '卓园4舍512窗户把手脱落',
       '窗户把手脱落，暂时无法完全关严。', NULL, r.phone, 'CANCELLED',
       NULL, NULL, NULL, '2026-06-25 08:10:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_021'
UNION ALL
SELECT 'BX202606250002', u.id, @repair_003_id, r.dorm_building, r.room_no, '家具', '智园10舍611床板异响',
       '床板翻身时异响明显，需要检查床板支撑结构。', NULL, r.phone, 'COMPLETED',
       NULL, '2026-06-25 12:20:00', '2026-06-25 15:10:00', '2026-06-25 11:30:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_004'
UNION ALL
SELECT 'BX202606260001', u.id, NULL, r.dorm_building, r.room_no, '网络', '慧园5舍409无线网信号弱',
       '宿舍内无线网信号不稳定，靠门位置更明显，需要检查路由和弱电端口。', NULL, r.phone, 'PENDING',
       NULL, NULL, NULL, '2026-06-26 17:25:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_014'
UNION ALL
SELECT 'BX202606270001', u.id, @repair_001_id, r.dorm_building, r.room_no, '水电', '智园10舍611卫生间地漏堵塞',
       '洗澡后排水速度很慢，卫生间有明显积水，需要疏通地漏。', NULL, r.phone, 'PROCESSING',
       NULL, '2026-06-27 09:50:00', NULL, '2026-06-27 09:15:00'
FROM tmp_residents r JOIN users u ON u.username = r.username WHERE r.username = 'stu_002';

INSERT INTO repair_records (order_id, operator_id, action, content, created_at)
VALUES
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606200001'), (SELECT id FROM users WHERE username = 'stu_001'), 'CREATE', '林书瑶提交报修，等待宿管中心受理。', '2026-06-20 08:15:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606200002'), (SELECT id FROM users WHERE username = 'stu_005'), 'CREATE', '王思远提交报修，等待宿管中心受理。', '2026-06-20 09:05:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606200002'), @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-20 10:10:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606200002'), @admin_id, 'ASSIGN', '张敏派单给李建国。', '2026-06-20 10:30:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606210001'), (SELECT id FROM users WHERE username = 'stu_008'), 'CREATE', '刘子涵提交报修，等待宿管中心受理。', '2026-06-21 12:50:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606210001'), @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-21 13:05:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606210001'), @admin_id, 'ASSIGN', '张敏派单给曹建军。', '2026-06-21 13:20:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606210001'), @repair_002_id, 'START', '曹建军开始检查宿舍网络线路和端口。', '2026-06-21 14:00:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220001'), (SELECT id FROM users WHERE username = 'stu_010'), 'CREATE', '李清扬提交报修，等待宿管中心受理。', '2026-06-22 08:35:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220001'), @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-22 08:50:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220001'), @admin_id, 'ASSIGN', '张敏派单给邵明远。', '2026-06-22 09:10:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220001'), @repair_003_id, 'START', '邵明远开始处理衣柜合页。', '2026-06-22 10:20:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220001'), @repair_003_id, 'FINISH', '已加固合页并测试开合正常，等待李清扬确认。', '2026-06-22 11:40:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220002'), (SELECT id FROM users WHERE username = 'stu_012'), 'CREATE', '郑宇航提交报修，等待宿管中心受理。', '2026-06-22 13:20:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220002'), @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-22 13:40:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220002'), @admin_id, 'ASSIGN', '张敏派单给李建国。', '2026-06-22 14:00:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220002'), @repair_001_id, 'START', '李建国开始检查空调滤网和制冷状态。', '2026-06-22 15:00:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220002'), @repair_001_id, 'FINISH', '已清理滤网并完成试运行，制冷恢复正常。', '2026-06-22 16:10:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220002'), (SELECT id FROM users WHERE username = 'stu_012'), 'CONFIRM', '郑宇航确认维修完成。', '2026-06-22 16:30:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606220002'), (SELECT id FROM users WHERE username = 'stu_012'), 'FEEDBACK', '郑宇航提交评价，评分：5。', '2026-06-22 16:35:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606230001'), (SELECT id FROM users WHERE username = 'stu_015'), 'CREATE', '何沐阳提交报修，等待宿管中心受理。', '2026-06-23 09:00:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606230001'), @admin_id, 'REJECT', '张敏驳回：请补充具体设备位置、设备名称和故障现象。', '2026-06-23 09:20:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606230002'), (SELECT id FROM users WHERE username = 'stu_017'), 'CREATE', '朱星河提交报修，等待宿管中心受理。', '2026-06-23 10:45:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606230002'), @admin_id, 'APPROVE', '张敏审核通过，等待安排维修人员。', '2026-06-23 11:10:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606240001'), (SELECT id FROM users WHERE username = 'stu_020'), 'CREATE', '袁知夏提交报修，等待宿管中心受理。', '2026-06-24 14:20:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606240001'), @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-24 14:35:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606240001'), @admin_id, 'ASSIGN', '张敏派单给曹建军。', '2026-06-24 15:00:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606240001'), @repair_002_id, 'REASSIGN_REQUEST', '曹建军申请重派：需要电工专用工具。', '2026-06-24 16:10:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606250001'), (SELECT id FROM users WHERE username = 'stu_021'), 'CREATE', '程安澜提交报修，等待宿管中心受理。', '2026-06-25 08:10:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606250001'), (SELECT id FROM users WHERE username = 'stu_021'), 'CANCEL', '程安澜撤销报修。', '2026-06-25 08:25:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606250002'), (SELECT id FROM users WHERE username = 'stu_004'), 'CREATE', '许嘉宁提交报修，等待宿管中心受理。', '2026-06-25 11:30:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606250002'), @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-25 12:00:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606250002'), @admin_id, 'ASSIGN', '张敏派单给邵明远。', '2026-06-25 12:20:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606250002'), @repair_003_id, 'START', '邵明远开始检查床板支撑结构。', '2026-06-25 13:15:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606250002'), @repair_003_id, 'FINISH', '已加固床板支撑，异响消失。', '2026-06-25 15:10:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606250002'), (SELECT id FROM users WHERE username = 'stu_004'), 'CONFIRM', '许嘉宁确认维修完成。', '2026-06-25 15:40:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606250002'), (SELECT id FROM users WHERE username = 'stu_004'), 'FEEDBACK', '许嘉宁提交评价，评分：4。', '2026-06-25 15:45:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606260001'), (SELECT id FROM users WHERE username = 'stu_014'), 'CREATE', '郭景行提交报修，等待宿管中心受理。', '2026-06-26 17:25:00'),

  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606270001'), (SELECT id FROM users WHERE username = 'stu_002'), 'CREATE', '周亦辰提交报修，等待宿管中心受理。', '2026-06-27 09:15:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606270001'), @admin_id, 'APPROVE', '张敏审核通过。', '2026-06-27 09:35:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606270001'), @admin_id, 'ASSIGN', '张敏派单给李建国。', '2026-06-27 09:50:00'),
  ((SELECT id FROM repair_orders WHERE order_no = 'BX202606270001'), @repair_001_id, 'START', '李建国开始疏通卫生间地漏。', '2026-06-27 10:20:00');

INSERT INTO repair_feedbacks (order_id, student_id, score, comment, created_at)
VALUES
  (
    (SELECT id FROM repair_orders WHERE order_no = 'BX202606220002'),
    (SELECT id FROM users WHERE username = 'stu_012'),
    5,
    '维修速度快，空调已经正常制冷。',
    '2026-06-22 16:35:00'
  ),
  (
    (SELECT id FROM repair_orders WHERE order_no = 'BX202606250002'),
    (SELECT id FROM users WHERE username = 'stu_004'),
    4,
    '处理效果不错，希望后续能更快到场。',
    '2026-06-25 15:45:00'
  );

DROP TABLE IF EXISTS tmp_residents;

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
