package com.dorm.repair.interceptor;

import com.dorm.repair.common.BusinessException;
import com.dorm.repair.common.ErrorCode;
import com.dorm.repair.common.UserRole;
import com.dorm.repair.entity.User;
import com.dorm.repair.mapper.UserMapper;
import com.dorm.repair.security.CurrentUser;
import com.dorm.repair.security.RequireRole;
import com.dorm.repair.security.UserContext;
import com.dorm.repair.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final int STATUS_ENABLED = 1;

    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public JwtAuthInterceptor(JwtUtil jwtUtil, UserMapper userMapper) {
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Missing token");
        }

        try {
            Claims claims = jwtUtil.parseToken(authorization.substring(BEARER_PREFIX.length()));
            Long userId = claims.get("userId", Number.class).longValue();
            User user = userMapper.findById(userId);
            if (user == null) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, "User does not exist");
            }
            if (!Integer.valueOf(STATUS_ENABLED).equals(user.getStatus())) {
                throw new BusinessException(ErrorCode.FORBIDDEN, "Account is disabled");
            }
            CurrentUser currentUser = new CurrentUser(user.getId(), user.getUsername(), user.getRole());
            UserContext.set(currentUser);
            checkRole(handler, user.getRole());
            return true;
        } catch (BusinessException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid token");
        }
    }

    @Override
    public void afterCompletion(
        HttpServletRequest request,
        HttpServletResponse response,
        Object handler,
        Exception exception
    ) {
        UserContext.clear();
    }

    private void checkRole(Object handler, UserRole currentRole) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return;
        }
        RequireRole annotation = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (annotation == null) {
            annotation = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        }
        if (annotation == null) {
            return;
        }
        boolean matched = Arrays.asList(annotation.value()).contains(currentRole);
        if (!matched) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Permission denied");
        }
    }
}
