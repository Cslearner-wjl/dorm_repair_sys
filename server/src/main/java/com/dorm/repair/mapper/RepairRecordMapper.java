package com.dorm.repair.mapper;

import com.dorm.repair.entity.RepairRecord;
import com.dorm.repair.vo.RepairRecordVO;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RepairRecordMapper {

    int insert(RepairRecord record);

    List<RepairRecordVO> listByOrderId(@Param("orderId") Long orderId);
}
