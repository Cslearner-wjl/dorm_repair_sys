package com.dorm.repair.service.impl;

import com.dorm.repair.common.BusinessException;
import com.dorm.repair.common.ErrorCode;
import com.dorm.repair.common.PageResult;
import com.dorm.repair.common.UserRole;
import com.dorm.repair.dto.RoleUpdateDTO;
import com.dorm.repair.dto.StatusUpdateDTO;
import com.dorm.repair.dto.UserCreateDTO;
import com.dorm.repair.dto.UserUpdateDTO;
import com.dorm.repair.entity.User;
import com.dorm.repair.mapper.UserMapper;
import com.dorm.repair.service.UserService;
import com.dorm.repair.vo.UserVO;
import java.util.List;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private static final int STATUS_DISABLED = 0;
    private static final int STATUS_ENABLED = 1;

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public UserVO create(UserCreateDTO dto) {
        User existing = userMapper.findByUsername(dto.getUsername());
        if (existing != null) {
            throw new BusinessException(ErrorCode.CONFLICT, "账号已存在");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        user.setStatus(STATUS_ENABLED);
        userMapper.insert(user);
        return toVO(user);
    }

    @Override
    public PageResult<UserVO> list(Integer page, Integer pageSize, UserRole role, String keyword) {
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 10 : Math.min(pageSize, 100);
        int offset = (safePage - 1) * safePageSize;
        long total = userMapper.countUsers(role, normalizeKeyword(keyword));
        List<UserVO> items = userMapper.listUsers(role, normalizeKeyword(keyword), offset, safePageSize)
            .stream()
            .map(this::toVO)
            .toList();
        return PageResult.of(safePage, safePageSize, total, items);
    }

    @Override
    public List<UserVO> listRepairers() {
        return userMapper.listRepairers().stream()
            .map(this::toVO)
            .toList();
    }

    @Override
    @Transactional
    public UserVO update(Long id, UserUpdateDTO dto) {
        User user = requireUser(id);
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        int affected = userMapper.updateBaseInfo(user);
        if (affected == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }
        return toVO(requireUser(id));
    }

    @Override
    @Transactional
    public UserVO updateRole(Long id, RoleUpdateDTO dto) {
        requireUser(id);
        int affected = userMapper.updateRole(id, dto.getRole());
        if (affected == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }
        return toVO(requireUser(id));
    }

    @Override
    @Transactional
    public UserVO updateStatus(Long id, StatusUpdateDTO dto) {
        if (!Integer.valueOf(STATUS_ENABLED).equals(dto.getStatus())
            && !Integer.valueOf(STATUS_DISABLED).equals(dto.getStatus())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "账号状态只能为 0 或 1");
        }
        requireUser(id);
        int affected = userMapper.updateStatus(id, dto.getStatus());
        if (affected == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }
        return toVO(requireUser(id));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        requireUser(id);
        int affected = userMapper.softDelete(id);
        if (affected == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }
    }

    private User requireUser(Long id) {
        User user = userMapper.findById(id);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }
        return user;
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }
        return keyword.trim();
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
