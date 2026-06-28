package com.dorm.repair.mapper;

import com.dorm.repair.common.RepairStatus;
import com.dorm.repair.entity.RepairOrder;
import com.dorm.repair.vo.RepairDetailVO;
import com.dorm.repair.vo.RepairOrderVO;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RepairOrderMapper {

    int insert(RepairOrder order);

    RepairOrder findById(@Param("id") Long id);

    RepairOrderVO findVOById(@Param("id") Long id);

    RepairDetailVO findDetailById(@Param("id") Long id);

    long countRepairs(
        @Param("studentId") Long studentId,
        @Param("repairerId") Long repairerId,
        @Param("status") RepairStatus status,
        @Param("category") String category,
        @Param("keyword") String keyword
    );

    List<RepairOrderVO> listRepairs(
        @Param("studentId") Long studentId,
        @Param("repairerId") Long repairerId,
        @Param("status") RepairStatus status,
        @Param("category") String category,
        @Param("keyword") String keyword,
        @Param("offset") int offset,
        @Param("limit") int limit
    );

    int updateBaseInfo(RepairOrder order);

    int updateStatus(@Param("id") Long id, @Param("status") RepairStatus status);

    int softDelete(@Param("id") Long id);

    int reject(
        @Param("id") Long id,
        @Param("status") RepairStatus status,
        @Param("rejectReason") String rejectReason
    );

    int assign(
        @Param("id") Long id,
        @Param("status") RepairStatus status,
        @Param("repairerId") Long repairerId
    );

    int finish(@Param("id") Long id, @Param("status") RepairStatus status);

    int requestReassign(@Param("id") Long id, @Param("status") RepairStatus status);
}
