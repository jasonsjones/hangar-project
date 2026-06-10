package dev.jasonsjones.hanger_api.security;

import dev.jasonsjones.hanger_api.user.User;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    // 40-char secret comfortably exceeds the 32-byte HS256 minimum.
    private static final String SECRET = "test-only-jwt-signing-secret-0123456789ab";
    private static final long ONE_HOUR = 3_600_000L;

    @Test
    void shouldRoundTripUserIdThroughToken() {
        JwtService service = new JwtService(SECRET, ONE_HOUR);
        User user = new User("ada@example.com", "Ada", "Lovelace");

        String token = service.issueToken(user);
        UUID parsed = service.parseUserId(token);

        assertThat(parsed).isEqualTo(user.getId());
    }

    @Test
    void shouldRejectAnExpiredToken() {
        // A negative lifetime makes the token expire the instant it's issued.
        JwtService service = new JwtService(SECRET, -1_000L);
        User user = new User("ada@example.com", "Ada", "Lovelace");

        String token = service.issueToken(user);

        assertThatThrownBy(() -> service.parseUserId(token))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void shouldRejectATokenSignedWithADifferentSecret() {
        JwtService issuer = new JwtService(SECRET, ONE_HOUR);
        JwtService verifier = new JwtService(
                "a-completely-different-secret-key-0123456789", ONE_HOUR);
        User user = new User("ada@example.com", "Ada", "Lovelace");

        String token = issuer.issueToken(user);

        // Signature verification must fail when the verifying key doesn't match —
        // this is what stops an attacker from forging a token.
        assertThatThrownBy(() -> verifier.parseUserId(token))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void shouldRejectAGarbageToken() {
        JwtService service = new JwtService(SECRET, ONE_HOUR);

        assertThatThrownBy(() -> service.parseUserId("not.a.jwt"))
                .isInstanceOf(JwtException.class);
    }
}
