package com.dorm.repair.vo;

import java.util.List;

public class RepairDetailVO extends RepairOrderVO {

    private String description;
    private String imageUrls;
    private String contactPhone;
    private String rejectReason;
    private List<RepairRecordVO> records;
    private RepairFeedbackVO feedback;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(String imageUrls) {
        this.imageUrls = imageUrls;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getRejectReason() {
        return rejectReason;
    }

    public void setRejectReason(String rejectReason) {
        this.rejectReason = rejectReason;
    }

    public List<RepairRecordVO> getRecords() {
        return records;
    }

    public void setRecords(List<RepairRecordVO> records) {
        this.records = records;
    }

    public RepairFeedbackVO getFeedback() {
        return feedback;
    }

    public void setFeedback(RepairFeedbackVO feedback) {
        this.feedback = feedback;
    }
}
