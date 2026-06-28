package com.dorm.repair.dto;

import com.dorm.repair.common.UserRole;
import jakarta.validation.constraints.NotNull;

public class RoleUpdateDTO {

    @NotNull
    private UserRole role;

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}
