package dev.jasonsjones.hanger_api.credential;

import dev.jasonsjones.hanger_api.user.User;
import dev.jasonsjones.hanger_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jdbc.test.autoconfigure.DataJdbcTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.test.context.TestConfiguration;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJdbcTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({PasswordService.class, PasswordServiceTest.PasswordEncoderConfig.class})
class PasswordServiceTest {

    @TestConfiguration
    static class PasswordEncoderConfig {
        @Bean
        PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder(4);
        }
    }

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private CredentialRepository credentialRepository;

    @Autowired
    private UserRepository userRepository;

    private UUID userId;

    @BeforeEach
    void setUp() {
        User user = userRepository.save(new User("pw-test@example.com", "Pw", "Tester"));
        userId = user.getId();
    }

    @Test
    void shouldSetAndVerifyPassword() {
        passwordService.setPassword(userId, "correct-horse-battery-staple");

        assertThat(passwordService.verifyPassword(userId, "correct-horse-battery-staple")).isTrue();
    }

    @Test
    void shouldRejectWrongPassword() {
        passwordService.setPassword(userId, "correct-horse-battery-staple");

        assertThat(passwordService.verifyPassword(userId, "wrong-password")).isFalse();
    }

    @Test
    void shouldStoreHashedSecretNotRawPassword() {
        passwordService.setPassword(userId, "correct-horse-battery-staple");

        Credential stored = credentialRepository.findByUserIdAndProvider(userId, "password").orElseThrow();
        assertThat(stored.getSecret()).isNotEqualTo("correct-horse-battery-staple");
        assertThat(stored.getSecret()).startsWith("$2");
    }

    @Test
    void shouldOverwriteExistingPasswordOnSet() {
        passwordService.setPassword(userId, "first-password");
        passwordService.setPassword(userId, "second-password");

        assertThat(passwordService.verifyPassword(userId, "first-password")).isFalse();
        assertThat(passwordService.verifyPassword(userId, "second-password")).isTrue();
        assertThat(credentialRepository.findByUserIdAndProvider(userId, "password")).isPresent();
    }

    @Test
    void shouldReturnFalseWhenNoCredentialExists() {
        assertThat(passwordService.verifyPassword(userId, "anything")).isFalse();
    }

    @Test
    void shouldReturnFalseWhenRawPasswordIsNull() {
        passwordService.setPassword(userId, "real-password");

        assertThat(passwordService.verifyPassword(userId, null)).isFalse();
    }

    @Test
    void shouldRejectBlankPasswordOnSet() {
        assertThatThrownBy(() -> passwordService.setPassword(userId, ""))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> passwordService.setPassword(userId, "   "))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> passwordService.setPassword(userId, null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
