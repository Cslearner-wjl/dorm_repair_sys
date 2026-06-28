package com.dorm.repair.dto;

import jakarta.validation.constraints.NotBlank;

public class UserUpdateDTO {

    @NotBlank
    private String realName;

    @NotBlank
    private String phone;

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
