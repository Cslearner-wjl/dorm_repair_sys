package com.dorm.repair.vo;

public class DailyStatisticVO {

    private String date;
    private Long createdCount;
    private Long completedCount;

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Long getCreatedCount() {
        return createdCount;
    }

    public void setCreatedCount(Long createdCount) {
        this.createdCount = createdCount;
    }

    public Long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(Long completedCount) {
        this.completedCount = completedCount;
    }
}
