package com.dorm.repair.mapper;

import com.dorm.repair.entity.RepairFeedback;
import com.dorm.repair.vo.RepairFeedbackVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RepairFeedbackMapper {

    int insert(RepairFeedback feedback);

    RepairFeedbackVO findByOrderId(@Param("orderId") Long orderId);
}
