package com.dorm.repair.service.impl;

import com.dorm.repair.common.BusinessException;
import com.dorm.repair.common.ErrorCode;

abstract class StubServiceSupport {

    protected BusinessException notImplemented(String module) {
        return new BusinessException(ErrorCode.NOT_IMPLEMENTED, module + " service is not implemented yet");
    }
}
