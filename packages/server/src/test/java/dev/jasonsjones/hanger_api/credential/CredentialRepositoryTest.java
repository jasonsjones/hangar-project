package dev.jasonsjones.hanger_api.credential;

import dev.jasonsjones.hanger_api.user.User;
import dev.jasonsjones.hanger_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jdbc.test.autoconfigure.DataJdbcTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJdbcTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CredentialRepositoryTest {

    @Autowired
    private CredentialRepository credentialRepository;

    @Autowired
    private UserRepository userRepository;

    private UUID userId;

    @BeforeEach
    void setUp() {
        User user = userRepository.save(new User("cred-test@example.com", "Cred", "Tester"));
        userId = user.getId();
    }

    @Test
    void shouldSaveAndFindByUserIdAndProvider() {
        credentialRepository.save(Credential.password(userId, "hash-value"));

        Optional<Credential> found = credentialRepository.findByUserIdAndProvider(userId, "password");

        assertThat(found).isPresent();
        assertThat(found.get().getSecret()).isEqualTo("hash-value");
        assertThat(found.get().getProvider()).isEqualTo("password");
        assertThat(found.get().getUserId()).isEqualTo(userId);
    }

    @Test
    void shouldReturnEmptyWhenNoCredentialForProvider() {
        Optional<Credential> found = credentialRepository.findByUserIdAndProvider(userId, "password");
        assertThat(found).isEmpty();
    }

    @Test
    void shouldDetectExistingCredential() {
        credentialRepository.save(Credential.password(userId, "hash-value"));

        assertThat(credentialRepository.existsByUserIdAndProvider(userId, "password")).isTrue();
        assertThat(credentialRepository.existsByUserIdAndProvider(userId, "oauth_google")).isFalse();
    }

    @Test
    void shouldCascadeDeleteWhenUserDeleted() {
        credentialRepository.save(Credential.password(userId, "hash-value"));
        assertThat(credentialRepository.existsByUserIdAndProvider(userId, "password")).isTrue();

        userRepository.deleteById(userId);

        assertThat(credentialRepository.existsByUserIdAndProvider(userId, "password")).isFalse();
    }
}
