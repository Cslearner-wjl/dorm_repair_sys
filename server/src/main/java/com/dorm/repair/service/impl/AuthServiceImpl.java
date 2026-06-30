package com.dorm.repair.service.impl;

import com.dorm.repair.common.BusinessException;
import com.dorm.repair.common.ErrorCode;
import com.dorm.repair.common.UserRole;
import com.dorm.repair.dto.LoginDTO;
import com.dorm.repair.dto.RegisterDTO;
import com.dorm.repair.entity.User;
import com.dorm.repair.mapper.UserMapper;
import com.dorm.repair.security.UserContext;
import com.dorm.repair.service.AuthService;
import com.dorm.repair.util.JwtUtil;
import com.dorm.repair.vo.LoginVO;
import com.dorm.repair.vo.UserVO;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final int STATUS_ENABLED = 1;

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthServiceImpl(UserMapper userMapper, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public UserVO register(RegisterDTO dto) {
        User existing = userMapper.findByUsername(dto.getUsername());
        if (existing != null) {
            throw new BusinessException(ErrorCode.CONFLICT, "账号已存在");
        }

        if (dto.getRole() != null && dto.getRole() != UserRole.STUDENT) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "公开注册仅支持学生账号");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setRole(UserRole.STUDENT);
        user.setStatus(STATUS_ENABLED);
        userMapper.insert(user);
        return toVO(user);
    }

    @Override
    public LoginVO login(LoginDTO dto) {
        User user = userMapper.findByUsername(dto.getUsername());
        if (user == null || user.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "账号或密码错误");
        }
        if (!Integer.valueOf(STATUS_ENABLED).equals(user.getStatus())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "账号已被禁用");
        }
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "账号或密码错误");
        }

        LoginVO loginVO = new LoginVO();
        loginVO.setToken(jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole()));
        loginVO.setUser(toVO(user));
        return loginVO;
    }

    @Override
    public UserVO me() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Missing token");
        }

        User user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户不存在");
        }
        if (!Integer.valueOf(STATUS_ENABLED).equals(user.getStatus())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "账号已被禁用");
        }
        return toVO(user);
    }

    private UserVO toVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setPhone(user.getPhone());
        vo.setRole(user.getRole());
        vo.setStatus(user.getStatus());
        return vo;
    }
}
