package com.dorm.repair.controller;

import com.dorm.repair.common.ApiResponse;
import com.dorm.repair.common.PageResult;
import com.dorm.repair.common.UserRole;
import com.dorm.repair.dto.RoleUpdateDTO;
import com.dorm.repair.dto.StatusUpdateDTO;
import com.dorm.repair.dto.UserCreateDTO;
import com.dorm.repair.dto.UserUpdateDTO;
import com.dorm.repair.security.RequireRole;
import com.dorm.repair.service.UserService;
import com.dorm.repair.vo.UserVO;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequireRole(UserRole.ADMIN)
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ApiResponse<UserVO> create(@Valid @RequestBody UserCreateDTO dto) {
        return ApiResponse.success(userService.create(dto));
    }

    @GetMapping
    public ApiResponse<PageResult<UserVO>> list(
        @RequestParam(defaultValue = "1") Integer page,
        @RequestParam(defaultValue = "10") Integer pageSize,
        @RequestParam(required = false) UserRole role,
        @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.success(userService.list(page, pageSize, role, keyword));
    }

    @GetMapping("/repairers")
    public ApiResponse<List<UserVO>> repairers() {
        return ApiResponse.success(userService.listRepairers());
    }

    @PutMapping("/{id}")
    public ApiResponse<UserVO> update(@PathVariable Long id, @Valid @RequestBody UserUpdateDTO dto) {
        return ApiResponse.success(userService.update(id, dto));
    }

    @PutMapping("/{id}/role")
    public ApiResponse<UserVO> updateRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateDTO dto) {
        return ApiResponse.success(userService.updateRole(id, dto));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<UserVO> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateDTO dto) {
        return ApiResponse.success(userService.updateStatus(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ApiResponse.success(null);
    }
}
