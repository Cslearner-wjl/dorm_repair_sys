package com.dorm.repair.vo;

public class RepairerStatisticVO {

    private Long repairerId;
    private String repairerName;
    private Long activeCount;
    private Long completedCount;
    private Double averageScore;

    public Long getRepairerId() {
        return repairerId;
    }

    public void setRepairerId(Long repairerId) {
        this.repairerId = repairerId;
    }

    public String getRepairerName() {
        return repairerName;
    }

    public void setRepairerName(String repairerName) {
        this.repairerName = repairerName;
    }

    public Long getActiveCount() {
        return activeCount;
    }

    public void setActiveCount(Long activeCount) {
        this.activeCount = activeCount;
    }

    public Long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(Long completedCount) {
        this.completedCount = completedCount;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }
}
