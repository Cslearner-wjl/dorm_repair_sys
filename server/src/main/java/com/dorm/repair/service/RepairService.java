package com.dorm.repair.service;

import com.dorm.repair.common.PageResult;
import com.dorm.repair.dto.RepairAssignDTO;
import com.dorm.repair.dto.RepairCreateDTO;
import com.dorm.repair.dto.RepairFeedbackDTO;
import com.dorm.repair.dto.RepairFinishDTO;
import com.dorm.repair.dto.RepairQueryDTO;
import com.dorm.repair.dto.RepairReassignDTO;
import com.dorm.repair.dto.RepairRejectDTO;
import com.dorm.repair.dto.RepairUpdateDTO;
import com.dorm.repair.vo.RepairDetailVO;
import com.dorm.repair.vo.RepairOrderVO;

public interface RepairService {

    RepairOrderVO create(RepairCreateDTO dto);

    PageResult<RepairOrderVO> myRepairs(RepairQueryDTO query);

    PageResult<RepairOrderVO> allRepairs(RepairQueryDTO query);

    PageResult<RepairOrderVO> repairerRepairs(RepairQueryDTO query);

    RepairDetailVO detail(Long id);

    RepairOrderVO update(Long id, RepairUpdateDTO dto);

    void delete(Long id);

    RepairOrderVO cancel(Long id);

    RepairOrderVO approve(Long id);

    RepairOrderVO reject(Long id, RepairRejectDTO dto);

    RepairOrderVO assign(Long id, RepairAssignDTO dto);

    RepairOrderVO start(Long id);

    RepairOrderVO finish(Long id, RepairFinishDTO dto);

    RepairOrderVO requestReassign(Long id, RepairReassignDTO dto);

    RepairOrderVO confirm(Long id);

    RepairOrderVO feedback(Long id, RepairFeedbackDTO dto);
}
