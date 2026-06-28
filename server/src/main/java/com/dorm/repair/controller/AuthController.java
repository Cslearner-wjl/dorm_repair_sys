package com.dorm.repair.controller;

import com.dorm.repair.common.ApiResponse;
import com.dorm.repair.dto.LoginDTO;
import com.dorm.repair.dto.RegisterDTO;
import com.dorm.repair.service.AuthService;
import com.dorm.repair.vo.LoginVO;
import com.dorm.repair.vo.UserVO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<UserVO> register(@Valid @RequestBody RegisterDTO dto) {
        return ApiResponse.success("register success", authService.register(dto));
    }

    @PostMapping("/login")
    public ApiResponse<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return ApiResponse.success("login success", authService.login(dto));
    }

    @GetMapping("/me")
    public ApiResponse<UserVO> me() {
        return ApiResponse.success(authService.me());
    }
}
