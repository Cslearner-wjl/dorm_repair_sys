package com.dorm.repair.mapper;

import com.dorm.repair.common.RepairStatus;
import com.dorm.repair.vo.DailyStatisticVO;
import com.dorm.repair.vo.RepairerStatisticVO;
import com.dorm.repair.vo.StatisticItemVO;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StatisticsMapper {

    long countOrders();

    long countOrdersByStatus(@Param("status") RepairStatus status);

    Double averageScore();

    List<StatisticItemVO> listStatusStats();

    List<StatisticItemVO> listCategoryStats();

    List<StatisticItemVO> listBuildingStats();

    List<DailyStatisticVO> listDailyStats(@Param("days") int days);

    List<RepairerStatisticVO> listRepairerStats();
}
