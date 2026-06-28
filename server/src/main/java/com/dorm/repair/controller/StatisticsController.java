package com.dorm.repair.controller;

import com.dorm.repair.common.ApiResponse;
import com.dorm.repair.common.UserRole;
import com.dorm.repair.security.RequireRole;
import com.dorm.repair.service.StatisticsService;
import com.dorm.repair.vo.DailyStatisticVO;
import com.dorm.repair.vo.RepairerStatisticVO;
import com.dorm.repair.vo.StatisticItemVO;
import com.dorm.repair.vo.StatisticsOverviewVO;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequireRole(UserRole.ADMIN)
@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/overview")
    public ApiResponse<StatisticsOverviewVO> overview() {
        return ApiResponse.success(statisticsService.overview());
    }

    @GetMapping("/status")
    public ApiResponse<List<StatisticItemVO>> statusStats() {
        return ApiResponse.success(statisticsService.statusStats());
    }

    @GetMapping("/categories")
    public ApiResponse<List<StatisticItemVO>> categoryStats() {
        return ApiResponse.success(statisticsService.categoryStats());
    }

    @GetMapping("/buildings")
    public ApiResponse<List<StatisticItemVO>> buildingStats() {
        return ApiResponse.success(statisticsService.buildingStats());
    }

    @GetMapping("/daily")
    public ApiResponse<List<DailyStatisticVO>> dailyStats(@RequestParam(required = false) Integer days) {
        return ApiResponse.success(statisticsService.dailyStats(days));
    }

    @GetMapping("/repairers")
    public ApiResponse<List<RepairerStatisticVO>> repairerStats() {
        return ApiResponse.success(statisticsService.repairerStats());
    }
}
