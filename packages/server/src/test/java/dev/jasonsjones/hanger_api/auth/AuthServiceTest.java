package dev.jasonsjones.hanger_api.auth;

import dev.jasonsjones.hanger_api.credential.PasswordService;
import dev.jasonsjones.hanger_api.user.User;
import dev.jasonsjones.hanger_api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordService passwordService;

    @InjectMocks
    private AuthService authService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        existingUser = new User("ada@example.com", "Ada", "Lovelace");
    }

    @Test
    void shouldReturnUserWhenCredentialsValid() {
        when(userRepository.findByEmail("ada@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordService.verifyPassword(existingUser.getId(), "correcthorse")).thenReturn(true);

        Optional<User> result = authService.authenticate("ada@example.com", "correcthorse");

        assertThat(result).contains(existingUser);
    }

    @Test
    void shouldReturnEmptyWhenPasswordWrong() {
        when(userRepository.findByEmail("ada@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordService.verifyPassword(existingUser.getId(), "wrongpw")).thenReturn(false);

        Optional<User> result = authService.authenticate("ada@example.com", "wrongpw");

        assertThat(result).isEmpty();
        verify(passwordService).verifyPassword(existingUser.getId(), "wrongpw");
    }

    @Test
    void shouldReturnEmptyAndNotProbeCredentialsWhenEmailUnknown() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        Optional<User> result = authService.authenticate("ghost@example.com", "anything");

        assertThat(result).isEmpty();
        verify(passwordService, never()).verifyPassword(any(UUID.class), any());
    }
}
