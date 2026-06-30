package com.dorm.repair.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.dorm.repair.common.BusinessException;
import com.dorm.repair.common.ErrorCode;
import com.dorm.repair.common.RepairStatus;
import com.dorm.repair.common.UserRole;
import com.dorm.repair.dto.RepairAssignDTO;
import com.dorm.repair.dto.RepairFeedbackDTO;
import com.dorm.repair.dto.RepairFinishDTO;
import com.dorm.repair.dto.RepairQueryDTO;
import com.dorm.repair.entity.RepairFeedback;
import com.dorm.repair.entity.RepairOrder;
import com.dorm.repair.entity.RepairRecord;
import com.dorm.repair.entity.User;
import com.dorm.repair.mapper.RepairFeedbackMapper;
import com.dorm.repair.mapper.RepairOrderMapper;
import com.dorm.repair.mapper.RepairRecordMapper;
import com.dorm.repair.mapper.UserMapper;
import com.dorm.repair.security.CurrentUser;
import com.dorm.repair.security.UserContext;
import com.dorm.repair.vo.RepairOrderVO;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RepairServiceImplTest {

    @Mock
    private RepairOrderMapper repairOrderMapper;

    @Mock
    private RepairRecordMapper repairRecordMapper;

    @Mock
    private RepairFeedbackMapper repairFeedbackMapper;

    @Mock
    private UserMapper userMapper;

    private RepairServiceImpl repairService;

    @BeforeEach
    void setUp() {
        repairService = new RepairServiceImpl(repairOrderMapper, repairRecordMapper, repairFeedbackMapper, userMapper);
    }

    @AfterEach
    void tearDown() {
        UserContext.clear();
    }

    @Test
    void studentCannotAccessAdminRepairList() {
        asUser(1L, "student001", UserRole.STUDENT);

        BusinessException exception = assertThrows(
            BusinessException.class,
            () -> repairService.allRepairs(new RepairQueryDTO())
        );

        assertThat(exception.getCode()).isEqualTo(ErrorCode.FORBIDDEN.getCode());
        verifyNoInteractions(repairOrderMapper, repairRecordMapper, repairFeedbackMapper, userMapper);
    }

    @Test
    void completedOrderCannotBeAssignedAgain() {
        asUser(2L, "admin001", UserRole.ADMIN);
        when(repairOrderMapper.findById(10L)).thenReturn(order(10L, 1L, 3L, RepairStatus.COMPLETED));
        RepairAssignDTO dto = new RepairAssignDTO();
        dto.setRepairerId(3L);

        BusinessException exception = assertThrows(BusinessException.class, () -> repairService.assign(10L, dto));

        assertThat(exception.getCode()).isEqualTo(ErrorCode.CONFLICT.getCode());
        verify(userMapper, never()).findById(anyLong());
    }

    @Test
    void nonCreatorCannotConfirmOrder() {
        asUser(9L, "student009", UserRole.STUDENT);
        when(repairOrderMapper.findById(10L)).thenReturn(order(10L, 1L, 3L, RepairStatus.WAIT_CONFIRM));

        BusinessException exception = assertThrows(BusinessException.class, () -> repairService.confirm(10L));

        assertThat(exception.getCode()).isEqualTo(ErrorCode.FORBIDDEN.getCode());
        verify(repairOrderMapper, never()).updateStatus(anyLong(), any(RepairStatus.class));
    }

    @Test
    void nonAssignedRepairerCannotStartOrder() {
        asUser(4L, "repair004", UserRole.REPAIR);
        when(repairOrderMapper.findById(10L)).thenReturn(order(10L, 1L, 3L, RepairStatus.ASSIGNED));

        BusinessException exception = assertThrows(BusinessException.class, () -> repairService.start(10L));

        assertThat(exception.getCode()).isEqualTo(ErrorCode.FORBIDDEN.getCode());
        verify(repairOrderMapper, never()).updateStatus(anyLong(), any(RepairStatus.class));
    }

    @Test
    void fullRepairStateFlowCanReachFeedback() {
        RepairOrder order = order(10L, 1L, null, RepairStatus.PENDING);
        when(repairOrderMapper.findById(10L)).thenReturn(order);
        when(repairOrderMapper.findVOById(10L)).thenReturn(new RepairOrderVO());
        when(userMapper.findById(3L)).thenReturn(repairer(3L));
        when(repairFeedbackMapper.findByOrderId(10L)).thenReturn(null);
        when(repairOrderMapper.updateStatus(eq(10L), any(RepairStatus.class))).thenAnswer(invocation -> {
            order.setStatus(invocation.getArgument(1));
            return 1;
        });
        when(repairOrderMapper.assign(eq(10L), any(RepairStatus.class), eq(3L))).thenAnswer(invocation -> {
            order.setStatus(invocation.getArgument(1));
            order.setRepairerId(invocation.getArgument(2));
            return 1;
        });
        when(repairOrderMapper.finish(eq(10L), any(RepairStatus.class))).thenAnswer(invocation -> {
            order.setStatus(invocation.getArgument(1));
            return 1;
        });

        asUser(2L, "admin001", UserRole.ADMIN);
        repairService.approve(10L);
        assertThat(order.getStatus()).isEqualTo(RepairStatus.APPROVED);

        RepairAssignDTO assignDTO = new RepairAssignDTO();
        assignDTO.setRepairerId(3L);
        assignDTO.setRemark("优先处理");
        repairService.assign(10L, assignDTO);
        assertThat(order.getStatus()).isEqualTo(RepairStatus.ASSIGNED);
        assertThat(order.getRepairerId()).isEqualTo(3L);

        asUser(3L, "repair001", UserRole.REPAIR);
        repairService.start(10L);
        assertThat(order.getStatus()).isEqualTo(RepairStatus.PROCESSING);

        RepairFinishDTO finishDTO = new RepairFinishDTO();
        finishDTO.setContent("已修复");
        repairService.finish(10L, finishDTO);
        assertThat(order.getStatus()).isEqualTo(RepairStatus.WAIT_CONFIRM);

        asUser(1L, "student001", UserRole.STUDENT);
        repairService.confirm(10L);
        assertThat(order.getStatus()).isEqualTo(RepairStatus.COMPLETED);

        RepairFeedbackDTO feedbackDTO = new RepairFeedbackDTO();
        feedbackDTO.setScore(5);
        feedbackDTO.setComment("满意");
        repairService.feedback(10L, feedbackDTO);

        verify(repairFeedbackMapper).insert(any(RepairFeedback.class));
        verify(repairRecordMapper, org.mockito.Mockito.times(6)).insert(any(RepairRecord.class));
    }

    private void asUser(Long id, String username, UserRole role) {
        UserContext.set(new CurrentUser(id, username, role));
    }

    private RepairOrder order(Long id, Long studentId, Long repairerId, RepairStatus status) {
        RepairOrder order = new RepairOrder();
        order.setId(id);
        order.setStudentId(studentId);
        order.setRepairerId(repairerId);
        order.setStatus(status);
        return order;
    }

    private User repairer(Long id) {
        User user = new User();
        user.setId(id);
        user.setRealName("维修员演示账号");
        user.setRole(UserRole.REPAIR);
        user.setStatus(1);
        return user;
    }
}
