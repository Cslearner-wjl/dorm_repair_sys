package com.dorm.repair.dto;

import jakarta.validation.constraints.NotNull;

public class RepairAssignDTO {

    @NotNull
    private Long repairerId;

    private String remark;

    public Long getRepairerId() {
        return repairerId;
    }

    public void setRepairerId(Long repairerId) {
        this.repairerId = repairerId;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
