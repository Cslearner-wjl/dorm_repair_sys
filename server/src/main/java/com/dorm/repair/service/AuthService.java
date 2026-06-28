package com.dorm.repair.service;

import com.dorm.repair.dto.LoginDTO;
import com.dorm.repair.dto.RegisterDTO;
import com.dorm.repair.vo.LoginVO;
import com.dorm.repair.vo.UserVO;

public interface AuthService {

    UserVO register(RegisterDTO dto);

    LoginVO login(LoginDTO dto);

    UserVO me();
}
