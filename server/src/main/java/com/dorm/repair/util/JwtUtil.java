package com.dorm.repair.util;

import com.dorm.repair.common.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private final String secret;
    private final long expireMinutes;

    public JwtUtil(
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.expire-minutes}") long expireMinutes
    ) {
        this.secret = secret;
        this.expireMinutes = expireMinutes;
    }

    public String generateToken(Long userId, String username, UserRole role) {
        Date now = new Date();
        Date expiresAt = new Date(now.getTime() + expireMinutes * 60_000L);
        return Jwts.builder()
            .subject(username)
            .claim("userId", userId)
            .claim("role", role.name())
            .issuedAt(now)
            .expiration(expiresAt)
            .signWith(signingKey())
            .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
            .verifyWith(signingKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
