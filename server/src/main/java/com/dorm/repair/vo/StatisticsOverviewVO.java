package com.dorm.repair.vo;

import java.util.List;

public class StatisticsOverviewVO {

    private Long totalOrders;
    private Long pendingOrders;
    private Long processingOrders;
    private Long completedOrders;
    private Double averageScore;
    private List<StatisticItemVO> statusStats;
    private List<StatisticItemVO> categoryStats;
    private List<RepairerStatisticVO> repairerStats;

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(Long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public Long getProcessingOrders() {
        return processingOrders;
    }

    public void setProcessingOrders(Long processingOrders) {
        this.processingOrders = processingOrders;
    }

    public Long getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(Long completedOrders) {
        this.completedOrders = completedOrders;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public List<StatisticItemVO> getStatusStats() {
        return statusStats;
    }

    public void setStatusStats(List<StatisticItemVO> statusStats) {
        this.statusStats = statusStats;
    }

    public List<StatisticItemVO> getCategoryStats() {
        return categoryStats;
    }

    public void setCategoryStats(List<StatisticItemVO> categoryStats) {
        this.categoryStats = categoryStats;
    }

    public List<RepairerStatisticVO> getRepairerStats() {
        return repairerStats;
    }

    public void setRepairerStats(List<RepairerStatisticVO> repairerStats) {
        this.repairerStats = repairerStats;
    }
}
