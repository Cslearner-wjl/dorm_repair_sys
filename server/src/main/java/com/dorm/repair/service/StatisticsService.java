package com.dorm.repair.service;

import com.dorm.repair.vo.DailyStatisticVO;
import com.dorm.repair.vo.RepairerStatisticVO;
import com.dorm.repair.vo.StatisticItemVO;
import com.dorm.repair.vo.StatisticsOverviewVO;
import java.util.List;

public interface StatisticsService {

    StatisticsOverviewVO overview();

    List<StatisticItemVO> statusStats();

    List<StatisticItemVO> categoryStats();

    List<StatisticItemVO> buildingStats();

    List<DailyStatisticVO> dailyStats(Integer days);

    List<RepairerStatisticVO> repairerStats();
}
