package com.dorm.repair.dto;

import jakarta.validation.constraints.NotBlank;

public class RepairFinishDTO {

    @NotBlank
    private String content;

    private String imageUrls;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(String imageUrls) {
        this.imageUrls = imageUrls;
    }
}
