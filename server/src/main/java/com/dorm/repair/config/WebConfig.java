package com.dorm.repair.config;

import com.dorm.repair.interceptor.JwtAuthInterceptor;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final JwtAuthInterceptor jwtAuthInterceptor;
    private final List<String> allowedOrigins;
    private final Path uploadRoot;
    private final String uploadPublicPath;

    public WebConfig(
        JwtAuthInterceptor jwtAuthInterceptor,
        @Value("${app.cors.allowed-origins}") String allowedOrigins,
        @Value("${app.upload.dir}") String uploadDir,
        @Value("${app.upload.public-path}") String uploadPublicPath
    ) {
        this.jwtAuthInterceptor = jwtAuthInterceptor;
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isBlank())
            .toList();
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        this.uploadPublicPath = uploadPublicPath.endsWith("/")
            ? uploadPublicPath + "**"
            : uploadPublicPath + "/**";
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtAuthInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns(
                "/api/health",
                "/api/auth/register",
                "/api/auth/login",
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html"
            );
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(allowedOrigins.toArray(new String[0]))
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploadRoot.toUri().toString();
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        registry.addResourceHandler(uploadPublicPath)
            .addResourceLocations(location);
    }
}
