package com.dorm.repair.dto;

import jakarta.validation.constraints.NotNull;

public class StatusUpdateDTO {

    @NotNull
    private Integer status;

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
