package dev.jasonsjones.hanger_api.security;

import dev.jasonsjones.hanger_api.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Mints and validates the HS256 JSON Web Tokens we hand out on login/registration.
 *
 * <p>The token is stateless: everything a later request needs to identify the
 * caller (the user id as the {@code sub} claim, plus an {@code email} claim for
 * convenience) is signed into the token itself. We never store it server-side,
 * which is the whole point of JWT auth — no session table to consult on every
 * request. The trade-off is that a token can't be revoked before it expires, so
 * we keep the lifetime short.
 */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMillis;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration}") long expirationMillis) {
        // HS256 requires a key of at least 256 bits (32 bytes). Building the key
        // from the raw secret bytes lets us fail fast at startup if it's too short,
        // rather than at the first sign() call.
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = expirationMillis;
    }

    /**
     * Issues a signed token for the given user. {@code sub} is the user id;
     * {@code email} rides along as a custom claim so callers don't have to round-trip
     * to the database just to display who is logged in.
     */
    public String issueToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMillis)))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Parses and verifies a token, returning the user id from the {@code sub} claim.
     *
     * @throws JwtException if the token is malformed, tampered with, or expired.
     */
    public UUID parseUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return UUID.fromString(claims.getSubject());
    }
}
