package com.dorm.repair.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dorm.repair.common.BusinessException;
import com.dorm.repair.common.ErrorCode;
import com.dorm.repair.common.UserRole;
import com.dorm.repair.dto.RegisterDTO;
import com.dorm.repair.entity.User;
import com.dorm.repair.mapper.UserMapper;
import com.dorm.repair.util.JwtUtil;
import com.dorm.repair.vo.UserVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private JwtUtil jwtUtil;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userMapper, jwtUtil);
    }

    @Test
    void publicRegisterRejectsRepairRole() {
        RegisterDTO dto = registerDTO("repair-public", UserRole.REPAIR);
        when(userMapper.findByUsername("repair-public")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.register(dto));

        assertThat(exception.getCode()).isEqualTo(ErrorCode.BAD_REQUEST.getCode());
        assertThat(exception.getMessage()).contains("学生账号");
        verify(userMapper, never()).insert(any(User.class));
    }

    @Test
    void publicRegisterRejectsAdminRole() {
        RegisterDTO dto = registerDTO("admin-public", UserRole.ADMIN);
        when(userMapper.findByUsername("admin-public")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.register(dto));

        assertThat(exception.getCode()).isEqualTo(ErrorCode.BAD_REQUEST.getCode());
        verify(userMapper, never()).insert(any(User.class));
    }

    @Test
    void publicRegisterAlwaysCreatesStudentWhenRoleIsOmitted() {
        RegisterDTO dto = registerDTO("student-public", null);
        when(userMapper.findByUsername("student-public")).thenReturn(null);

        UserVO result = authService.register(dto);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userMapper).insert(userCaptor.capture());
        User inserted = userCaptor.getValue();
        assertThat(inserted.getRole()).isEqualTo(UserRole.STUDENT);
        assertThat(inserted.getStatus()).isEqualTo(1);
        assertThat(inserted.getPassword()).isNotEqualTo("123456");
        assertThat(result.getRole()).isEqualTo(UserRole.STUDENT);
    }

    @Test
    void publicRegisterRejectsDuplicateUsername() {
        RegisterDTO dto = registerDTO("student001", null);
        when(userMapper.findByUsername("student001")).thenReturn(new User());

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.register(dto));

        assertThat(exception.getCode()).isEqualTo(ErrorCode.CONFLICT.getCode());
        verify(userMapper, never()).insert(any(User.class));
    }

    private RegisterDTO registerDTO(String username, UserRole role) {
        RegisterDTO dto = new RegisterDTO();
        dto.setUsername(username);
        dto.setPassword("123456");
        dto.setRealName("测试学生");
        dto.setPhone("13800000009");
        dto.setRole(role);
        return dto;
    }
}
