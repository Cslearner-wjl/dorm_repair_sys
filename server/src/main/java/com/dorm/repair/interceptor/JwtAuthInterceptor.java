package com.dorm.repair.interceptor;

import com.dorm.repair.common.BusinessException;
import com.dorm.repair.common.ErrorCode;
import com.dorm.repair.common.UserRole;
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

    private final JwtUtil jwtUtil;

    public JwtAuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
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
            String username = claims.getSubject();
            UserRole role = UserRole.valueOf(claims.get("role", String.class));
            CurrentUser currentUser = new CurrentUser(userId, username, role);
            UserContext.set(currentUser);
            checkRole(handler, role);
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
