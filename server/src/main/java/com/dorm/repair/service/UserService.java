package com.dorm.repair.service;

import com.dorm.repair.common.PageResult;
import com.dorm.repair.common.UserRole;
import com.dorm.repair.dto.RoleUpdateDTO;
import com.dorm.repair.dto.StatusUpdateDTO;
import com.dorm.repair.dto.UserCreateDTO;
import com.dorm.repair.dto.UserUpdateDTO;
import com.dorm.repair.vo.UserVO;
import java.util.List;

public interface UserService {

    UserVO create(UserCreateDTO dto);

    PageResult<UserVO> list(Integer page, Integer pageSize, UserRole role, String keyword);

    List<UserVO> listRepairers();

    UserVO update(Long id, UserUpdateDTO dto);

    UserVO updateRole(Long id, RoleUpdateDTO dto);

    UserVO updateStatus(Long id, StatusUpdateDTO dto);

    void delete(Long id);
}
