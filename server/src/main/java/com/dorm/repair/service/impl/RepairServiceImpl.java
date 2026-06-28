package com.dorm.repair.service.impl;

import com.dorm.repair.common.BusinessException;
import com.dorm.repair.common.ErrorCode;
import com.dorm.repair.common.PageResult;
import com.dorm.repair.common.RepairStatus;
import com.dorm.repair.common.UserRole;
import com.dorm.repair.dto.RepairAssignDTO;
import com.dorm.repair.dto.RepairCreateDTO;
import com.dorm.repair.dto.RepairFeedbackDTO;
import com.dorm.repair.dto.RepairFinishDTO;
import com.dorm.repair.dto.RepairQueryDTO;
import com.dorm.repair.dto.RepairReassignDTO;
import com.dorm.repair.dto.RepairRejectDTO;
import com.dorm.repair.dto.RepairUpdateDTO;
import com.dorm.repair.entity.RepairOrder;
import com.dorm.repair.entity.RepairFeedback;
import com.dorm.repair.entity.RepairRecord;
import com.dorm.repair.entity.User;
import com.dorm.repair.mapper.RepairFeedbackMapper;
import com.dorm.repair.mapper.RepairOrderMapper;
import com.dorm.repair.mapper.RepairRecordMapper;
import com.dorm.repair.mapper.UserMapper;
import com.dorm.repair.security.CurrentUser;
import com.dorm.repair.security.UserContext;
import com.dorm.repair.service.RepairService;
import com.dorm.repair.vo.RepairDetailVO;
import com.dorm.repair.vo.RepairOrderVO;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RepairServiceImpl extends StubServiceSupport implements RepairService {

    private static final DateTimeFormatter ORDER_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final RepairOrderMapper repairOrderMapper;
    private final RepairRecordMapper repairRecordMapper;
    private final RepairFeedbackMapper repairFeedbackMapper;
    private final UserMapper userMapper;

    public RepairServiceImpl(
        RepairOrderMapper repairOrderMapper,
        RepairRecordMapper repairRecordMapper,
        RepairFeedbackMapper repairFeedbackMapper,
        UserMapper userMapper
    ) {
        this.repairOrderMapper = repairOrderMapper;
        this.repairRecordMapper = repairRecordMapper;
        this.repairFeedbackMapper = repairFeedbackMapper;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public RepairOrderVO create(RepairCreateDTO dto) {
        CurrentUser currentUser = requireCurrentUser();
        if (currentUser.getRole() != UserRole.STUDENT) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Only students can create repair orders");
        }

        RepairOrder order = new RepairOrder();
        order.setOrderNo(generateOrderNo());
        order.setStudentId(currentUser.getId());
        order.setDormBuilding(dto.getDormBuilding());
        order.setRoomNo(dto.getRoomNo());
        order.setCategory(dto.getCategory());
        order.setTitle(dto.getTitle());
        order.setDescription(dto.getDescription());
        order.setImageUrls(dto.getImageUrls());
        order.setContactPhone(dto.getContactPhone());
        order.setStatus(RepairStatus.PENDING);
        repairOrderMapper.insert(order);

        addRecord(order.getId(), currentUser.getId(), "CREATE", "Student submitted repair order");
        return repairOrderMapper.findVOById(order.getId());
    }

    @Override
    public PageResult<RepairOrderVO> myRepairs(RepairQueryDTO query) {
        CurrentUser currentUser = requireCurrentUser();
        return listByQuery(currentUser.getId(), null, query);
    }

    @Override
    public PageResult<RepairOrderVO> allRepairs(RepairQueryDTO query) {
        requireAdmin();
        return listByQuery(null, null, query);
    }

    @Override
    public PageResult<RepairOrderVO> repairerRepairs(RepairQueryDTO query) {
        CurrentUser currentUser = requireRepairer();
        return listByQuery(null, currentUser.getId(), query);
    }

    @Override
    public RepairDetailVO detail(Long id) {
        CurrentUser currentUser = requireCurrentUser();
        RepairOrder order = requireOrder(id);
        ensureCanView(order, currentUser);

        RepairDetailVO detail = repairOrderMapper.findDetailById(id);
        if (detail == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Repair order not found");
        }
        detail.setRecords(repairRecordMapper.listByOrderId(id));
        detail.setFeedback(repairFeedbackMapper.findByOrderId(id));
        return detail;
    }

    @Override
    @Transactional
    public RepairOrderVO update(Long id, RepairUpdateDTO dto) {
        CurrentUser currentUser = requireStudent();
        RepairOrder order = requireOrder(id);
        ensureOrderStudent(order, currentUser);
        requireStatus(order, RepairStatus.PENDING, "Only pending orders can be updated");

        order.setDormBuilding(dto.getDormBuilding().trim());
        order.setRoomNo(dto.getRoomNo().trim());
        order.setCategory(dto.getCategory().trim());
        order.setTitle(dto.getTitle().trim());
        order.setDescription(dto.getDescription().trim());
        order.setImageUrls(normalize(dto.getImageUrls()));
        order.setContactPhone(dto.getContactPhone().trim());
        repairOrderMapper.updateBaseInfo(order);

        addRecord(id, currentUser.getId(), "UPDATE", "Student updated repair order");
        return repairOrderMapper.findVOById(id);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        CurrentUser currentUser = requireCurrentUser();
        RepairOrder order = requireOrder(id);
        if (currentUser.getRole() == UserRole.ADMIN) {
            addRecord(id, currentUser.getId(), "DELETE", "Admin deleted repair order");
            repairOrderMapper.softDelete(id);
            return;
        }
        if (currentUser.getRole() == UserRole.STUDENT) {
            ensureOrderStudent(order, currentUser);
            if (
                order.getStatus() != RepairStatus.PENDING
                    && order.getStatus() != RepairStatus.CANCELLED
                    && order.getStatus() != RepairStatus.REJECTED
            ) {
                throw new BusinessException(
                    ErrorCode.CONFLICT,
                    "Only pending, cancelled or rejected orders can be deleted by student"
                );
            }
            addRecord(id, currentUser.getId(), "DELETE", "Student deleted repair order");
            repairOrderMapper.softDelete(id);
            return;
        }
        throw new BusinessException(ErrorCode.FORBIDDEN, "No permission to delete this repair order");
    }

    @Override
    @Transactional
    public RepairOrderVO cancel(Long id) {
        CurrentUser currentUser = requireStudent();
        RepairOrder order = requireOrder(id);
        ensureOrderStudent(order, currentUser);
        requireStatus(order, RepairStatus.PENDING, "Only pending orders can be cancelled");

        repairOrderMapper.updateStatus(id, RepairStatus.CANCELLED);
        addRecord(id, currentUser.getId(), "CANCEL", "Student cancelled repair order");
        return repairOrderMapper.findVOById(id);
    }

    @Override
    @Transactional
    public RepairOrderVO approve(Long id) {
        CurrentUser currentUser = requireAdmin();
        RepairOrder order = requireOrder(id);
        requireStatus(order, RepairStatus.PENDING, "Only pending orders can be approved");

        repairOrderMapper.updateStatus(id, RepairStatus.APPROVED);
        addRecord(id, currentUser.getId(), "APPROVE", "Admin approved repair order");
        return repairOrderMapper.findVOById(id);
    }

    @Override
    @Transactional
    public RepairOrderVO reject(Long id, RepairRejectDTO dto) {
        CurrentUser currentUser = requireAdmin();
        RepairOrder order = requireOrder(id);
        requireStatus(order, RepairStatus.PENDING, "Only pending orders can be rejected");

        String reason = normalize(dto.getReason());
        if (reason == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Reject reason is required");
        }

        repairOrderMapper.reject(id, RepairStatus.REJECTED, reason);
        addRecord(id, currentUser.getId(), "REJECT", "Admin rejected repair order: " + reason);
        return repairOrderMapper.findVOById(id);
    }

    @Override
    @Transactional
    public RepairOrderVO assign(Long id, RepairAssignDTO dto) {
        CurrentUser currentUser = requireAdmin();
        RepairOrder order = requireOrder(id);
        if (order.getStatus() != RepairStatus.APPROVED && order.getStatus() != RepairStatus.NEED_REASSIGN) {
            throw new BusinessException(ErrorCode.CONFLICT, "Only approved or reassignment-needed orders can be assigned");
        }

        User repairer = userMapper.findById(dto.getRepairerId());
        if (repairer == null || repairer.getRole() != UserRole.REPAIR || !Integer.valueOf(1).equals(repairer.getStatus())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Repairer is invalid or disabled");
        }

        repairOrderMapper.assign(id, RepairStatus.ASSIGNED, dto.getRepairerId());
        String remark = normalize(dto.getRemark());
        String content = "Admin assigned repair order to repairer: " + repairer.getRealName();
        if (remark != null) {
            content = content + "; remark: " + remark;
        }
        addRecord(id, currentUser.getId(), "ASSIGN", content);
        return repairOrderMapper.findVOById(id);
    }

    @Override
    @Transactional
    public RepairOrderVO start(Long id) {
        CurrentUser currentUser = requireRepairer();
        RepairOrder order = requireOrder(id);
        ensureAssignedRepairer(order, currentUser);
        requireStatus(order, RepairStatus.ASSIGNED, "Only assigned orders can be started");

        repairOrderMapper.updateStatus(id, RepairStatus.PROCESSING);
        addRecord(id, currentUser.getId(), "START", "Repairer started processing repair order");
        return repairOrderMapper.findVOById(id);
    }

    @Override
    @Transactional
    public RepairOrderVO finish(Long id, RepairFinishDTO dto) {
        CurrentUser currentUser = requireRepairer();
        RepairOrder order = requireOrder(id);
        ensureAssignedRepairer(order, currentUser);
        requireStatus(order, RepairStatus.PROCESSING, "Only processing orders can be finished");

        String content = normalize(dto.getContent());
        if (content == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Finish content is required");
        }

        repairOrderMapper.finish(id, RepairStatus.WAIT_CONFIRM);
        String recordContent = "Repairer finished repair: " + content;
        String imageUrls = normalize(dto.getImageUrls());
        if (imageUrls != null) {
            recordContent = recordContent + "; images: " + imageUrls;
        }
        addRecord(id, currentUser.getId(), "FINISH", recordContent);
        return repairOrderMapper.findVOById(id);
    }

    @Override
    @Transactional
    public RepairOrderVO requestReassign(Long id, RepairReassignDTO dto) {
        CurrentUser currentUser = requireRepairer();
        RepairOrder order = requireOrder(id);
        ensureAssignedRepairer(order, currentUser);
        if (order.getStatus() != RepairStatus.ASSIGNED && order.getStatus() != RepairStatus.PROCESSING) {
            throw new BusinessException(ErrorCode.CONFLICT, "Only assigned or processing orders can request reassignment");
        }

        String reason = normalize(dto.getReason());
        if (reason == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Reassign reason is required");
        }

        repairOrderMapper.requestReassign(id, RepairStatus.NEED_REASSIGN);
        addRecord(id, currentUser.getId(), "REASSIGN_REQUEST", "Repairer requested reassignment: " + reason);
        return repairOrderMapper.findVOById(id);
    }

    @Override
    @Transactional
    public RepairOrderVO confirm(Long id) {
        CurrentUser currentUser = requireStudent();
        RepairOrder order = requireOrder(id);
        ensureOrderStudent(order, currentUser);
        requireStatus(order, RepairStatus.WAIT_CONFIRM, "Only waiting-confirm orders can be confirmed");

        repairOrderMapper.updateStatus(id, RepairStatus.COMPLETED);
        addRecord(id, currentUser.getId(), "CONFIRM", "Student confirmed repair order completed");
        return repairOrderMapper.findVOById(id);
    }

    @Override
    @Transactional
    public RepairOrderVO feedback(Long id, RepairFeedbackDTO dto) {
        CurrentUser currentUser = requireStudent();
        RepairOrder order = requireOrder(id);
        ensureOrderStudent(order, currentUser);
        requireStatus(order, RepairStatus.COMPLETED, "Only completed orders can be evaluated");
        if (repairFeedbackMapper.findByOrderId(id) != null) {
            throw new BusinessException(ErrorCode.CONFLICT, "Repair order already has feedback");
        }

        RepairFeedback feedback = new RepairFeedback();
        feedback.setOrderId(id);
        feedback.setStudentId(currentUser.getId());
        feedback.setScore(dto.getScore());
        feedback.setComment(normalize(dto.getComment()));
        repairFeedbackMapper.insert(feedback);

        String content = "Student submitted feedback, score: " + dto.getScore();
        String comment = normalize(dto.getComment());
        if (comment != null) {
            content = content + "; comment: " + comment;
        }
        addRecord(id, currentUser.getId(), "FEEDBACK", content);
        return repairOrderMapper.findVOById(id);
    }

    private PageResult<RepairOrderVO> listByQuery(Long studentId, Long repairerId, RepairQueryDTO query) {
        RepairQueryDTO safeQuery = query == null ? new RepairQueryDTO() : query;
        int page = safeQuery.getPage() == null || safeQuery.getPage() < 1 ? 1 : safeQuery.getPage();
        int pageSize = safeQuery.getPageSize() == null || safeQuery.getPageSize() < 1
            ? 10
            : Math.min(safeQuery.getPageSize(), 100);
        int offset = (page - 1) * pageSize;
        String keyword = normalize(safeQuery.getKeyword());
        long total = repairOrderMapper.countRepairs(
            studentId,
            repairerId,
            safeQuery.getStatus(),
            normalize(safeQuery.getCategory()),
            keyword
        );
        return PageResult.of(
            page,
            pageSize,
            total,
            repairOrderMapper.listRepairs(
                studentId,
                repairerId,
                safeQuery.getStatus(),
                normalize(safeQuery.getCategory()),
                keyword,
                offset,
                pageSize
            )
        );
    }

    private void ensureCanView(RepairOrder order, CurrentUser currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return;
        }
        if (currentUser.getRole() == UserRole.STUDENT && currentUser.getId().equals(order.getStudentId())) {
            return;
        }
        if (currentUser.getRole() == UserRole.REPAIR && currentUser.getId().equals(order.getRepairerId())) {
            return;
        }
        throw new BusinessException(ErrorCode.FORBIDDEN, "No permission to view this repair order");
    }

    private RepairOrder requireOrder(Long id) {
        RepairOrder order = repairOrderMapper.findById(id);
        if (order == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Repair order not found");
        }
        return order;
    }

    private CurrentUser requireAdmin() {
        CurrentUser currentUser = requireCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Admin permission required");
        }
        return currentUser;
    }

    private CurrentUser requireStudent() {
        CurrentUser currentUser = requireCurrentUser();
        if (currentUser.getRole() != UserRole.STUDENT) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Student permission required");
        }
        return currentUser;
    }

    private CurrentUser requireRepairer() {
        CurrentUser currentUser = requireCurrentUser();
        if (currentUser.getRole() != UserRole.REPAIR) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Repairer permission required");
        }
        return currentUser;
    }

    private CurrentUser requireCurrentUser() {
        CurrentUser currentUser = UserContext.get();
        if (currentUser == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Missing token");
        }
        return currentUser;
    }

    private void requireStatus(RepairOrder order, RepairStatus status, String message) {
        if (order.getStatus() != status) {
            throw new BusinessException(ErrorCode.CONFLICT, message);
        }
    }

    private void ensureAssignedRepairer(RepairOrder order, CurrentUser currentUser) {
        if (!currentUser.getId().equals(order.getRepairerId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Only assigned repairer can operate this repair order");
        }
    }

    private void ensureOrderStudent(RepairOrder order, CurrentUser currentUser) {
        if (!currentUser.getId().equals(order.getStudentId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Only order creator can operate this repair order");
        }
    }

    private void addRecord(Long orderId, Long operatorId, String action, String content) {
        RepairRecord record = new RepairRecord();
        record.setOrderId(orderId);
        record.setOperatorId(operatorId);
        record.setAction(action);
        record.setContent(content);
        repairRecordMapper.insert(record);
    }

    private String generateOrderNo() {
        String date = LocalDate.now().format(ORDER_DATE_FORMATTER);
        int random = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "BX" + date + random;
    }

    private String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
