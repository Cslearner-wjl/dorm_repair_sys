package com.dorm.repair.controller;

import com.dorm.repair.common.ApiResponse;
import com.dorm.repair.common.PageResult;
import com.dorm.repair.common.UserRole;
import com.dorm.repair.dto.RepairAssignDTO;
import com.dorm.repair.dto.RepairCreateDTO;
import com.dorm.repair.dto.RepairFeedbackDTO;
import com.dorm.repair.dto.RepairFinishDTO;
import com.dorm.repair.dto.RepairQueryDTO;
import com.dorm.repair.dto.RepairReassignDTO;
import com.dorm.repair.dto.RepairRejectDTO;
import com.dorm.repair.dto.RepairUpdateDTO;
import com.dorm.repair.security.RequireRole;
import com.dorm.repair.service.RepairService;
import com.dorm.repair.vo.RepairDetailVO;
import com.dorm.repair.vo.RepairOrderVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/repairs")
public class RepairController {

    private final RepairService repairService;

    public RepairController(RepairService repairService) {
        this.repairService = repairService;
    }

    @RequireRole(UserRole.STUDENT)
    @PostMapping
    public ApiResponse<RepairOrderVO> create(@Valid @RequestBody RepairCreateDTO dto) {
        return ApiResponse.success(repairService.create(dto));
    }

    @RequireRole(UserRole.STUDENT)
    @GetMapping("/my")
    public ApiResponse<PageResult<RepairOrderVO>> myRepairs(@ModelAttribute RepairQueryDTO query) {
        return ApiResponse.success(repairService.myRepairs(query));
    }

    @RequireRole(UserRole.REPAIR)
    @GetMapping("/repairer/my")
    public ApiResponse<PageResult<RepairOrderVO>> repairerRepairs(@ModelAttribute RepairQueryDTO query) {
        return ApiResponse.success(repairService.repairerRepairs(query));
    }

    @RequireRole(UserRole.ADMIN)
    @GetMapping
    public ApiResponse<PageResult<RepairOrderVO>> allRepairs(@ModelAttribute RepairQueryDTO query) {
        return ApiResponse.success(repairService.allRepairs(query));
    }

    @GetMapping("/{id}")
    public ApiResponse<RepairDetailVO> detail(@PathVariable Long id) {
        return ApiResponse.success(repairService.detail(id));
    }

    @RequireRole(UserRole.STUDENT)
    @PutMapping("/{id}")
    public ApiResponse<RepairOrderVO> update(@PathVariable Long id, @Valid @RequestBody RepairUpdateDTO dto) {
        return ApiResponse.success(repairService.update(id, dto));
    }

    @RequireRole({UserRole.ADMIN, UserRole.STUDENT})
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        repairService.delete(id);
        return ApiResponse.success(null);
    }

    @RequireRole(UserRole.STUDENT)
    @PostMapping("/{id}/cancel")
    public ApiResponse<RepairOrderVO> cancel(@PathVariable Long id) {
        return ApiResponse.success(repairService.cancel(id));
    }

    @RequireRole(UserRole.ADMIN)
    @PostMapping("/{id}/approve")
    public ApiResponse<RepairOrderVO> approve(@PathVariable Long id) {
        return ApiResponse.success(repairService.approve(id));
    }

    @RequireRole(UserRole.ADMIN)
    @PostMapping("/{id}/reject")
    public ApiResponse<RepairOrderVO> reject(@PathVariable Long id, @Valid @RequestBody RepairRejectDTO dto) {
        return ApiResponse.success(repairService.reject(id, dto));
    }

    @RequireRole(UserRole.ADMIN)
    @PostMapping("/{id}/assign")
    public ApiResponse<RepairOrderVO> assign(@PathVariable Long id, @Valid @RequestBody RepairAssignDTO dto) {
        return ApiResponse.success(repairService.assign(id, dto));
    }

    @RequireRole(UserRole.REPAIR)
    @PostMapping("/{id}/start")
    public ApiResponse<RepairOrderVO> start(@PathVariable Long id) {
        return ApiResponse.success(repairService.start(id));
    }

    @RequireRole(UserRole.REPAIR)
    @PostMapping("/{id}/finish")
    public ApiResponse<RepairOrderVO> finish(@PathVariable Long id, @Valid @RequestBody RepairFinishDTO dto) {
        return ApiResponse.success(repairService.finish(id, dto));
    }

    @RequireRole(UserRole.REPAIR)
    @PostMapping("/{id}/reassign")
    public ApiResponse<RepairOrderVO> requestReassign(
        @PathVariable Long id,
        @Valid @RequestBody RepairReassignDTO dto
    ) {
        return ApiResponse.success(repairService.requestReassign(id, dto));
    }

    @RequireRole(UserRole.STUDENT)
    @PostMapping("/{id}/confirm")
    public ApiResponse<RepairOrderVO> confirm(@PathVariable Long id) {
        return ApiResponse.success(repairService.confirm(id));
    }

    @RequireRole(UserRole.STUDENT)
    @PostMapping("/{id}/feedback")
    public ApiResponse<RepairOrderVO> feedback(@PathVariable Long id, @Valid @RequestBody RepairFeedbackDTO dto) {
        return ApiResponse.success(repairService.feedback(id, dto));
    }
}
