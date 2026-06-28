package com.dorm.repair.service.impl;

import com.dorm.repair.common.RepairStatus;
import com.dorm.repair.mapper.StatisticsMapper;
import com.dorm.repair.service.StatisticsService;
import com.dorm.repair.vo.DailyStatisticVO;
import com.dorm.repair.vo.RepairerStatisticVO;
import com.dorm.repair.vo.StatisticItemVO;
import com.dorm.repair.vo.StatisticsOverviewVO;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    private final StatisticsMapper statisticsMapper;

    public StatisticsServiceImpl(StatisticsMapper statisticsMapper) {
        this.statisticsMapper = statisticsMapper;
    }

    @Override
    public StatisticsOverviewVO overview() {
        StatisticsOverviewVO overview = new StatisticsOverviewVO();
        overview.setTotalOrders(statisticsMapper.countOrders());
        overview.setPendingOrders(statisticsMapper.countOrdersByStatus(RepairStatus.PENDING));
        overview.setProcessingOrders(statisticsMapper.countOrdersByStatus(RepairStatus.PROCESSING));
        overview.setCompletedOrders(statisticsMapper.countOrdersByStatus(RepairStatus.COMPLETED));
        overview.setAverageScore(statisticsMapper.averageScore());
        overview.setStatusStats(statisticsMapper.listStatusStats());
        overview.setCategoryStats(statisticsMapper.listCategoryStats());
        overview.setRepairerStats(statisticsMapper.listRepairerStats());
        return overview;
    }

    @Override
    public List<StatisticItemVO> statusStats() {
        return statisticsMapper.listStatusStats();
    }

    @Override
    public List<StatisticItemVO> categoryStats() {
        return statisticsMapper.listCategoryStats();
    }

    @Override
    public List<StatisticItemVO> buildingStats() {
        return statisticsMapper.listBuildingStats();
    }

    @Override
    public List<DailyStatisticVO> dailyStats(Integer days) {
        return statisticsMapper.listDailyStats(normalizeDays(days));
    }

    @Override
    public List<RepairerStatisticVO> repairerStats() {
        return statisticsMapper.listRepairerStats();
    }

    private int normalizeDays(Integer days) {
        if (days == null || days < 1) {
            return 7;
        }
        return Math.min(days, 90);
    }
}
