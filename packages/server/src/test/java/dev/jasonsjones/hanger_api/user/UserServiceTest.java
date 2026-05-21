package dev.jasonsjones.hanger_api.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private static final UUID ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID MISSING_ID = UUID.fromString("00000000-0000-0000-0000-000000000099");

    @Test
    void shouldReturnAllUsers() {
        List<User> users = List.of(
                new User("a@example.com", "Alice", "Smith"),
                new User("b@example.com", "Bob", "Jones")
        );
        when(userRepository.findAll()).thenReturn(users);

        assertThat(userService.findAll()).hasSize(2);
    }

    @Test
    void shouldReturnUserById() {
        User user = new User("a@example.com", "Alice", "Smith");
        when(userRepository.findById(ID)).thenReturn(Optional.of(user));

        assertThat(userService.findById(ID)).isPresent();
    }

    @Test
    void shouldReturnEmptyWhenUserNotFound() {
        when(userRepository.findById(MISSING_ID)).thenReturn(Optional.empty());

        assertThat(userService.findById(MISSING_ID)).isEmpty();
    }

    @Test
    void shouldCreateUser() {
        User user = new User("a@example.com", "Alice", "Smith");
        when(userRepository.existsByEmail("a@example.com")).thenReturn(false);
        when(userRepository.save(user)).thenReturn(user);

        User created = userService.create(user);
        assertThat(created.getEmail()).isEqualTo("a@example.com");
        verify(userRepository).save(user);
    }

    @Test
    void shouldThrowWhenEmailAlreadyExists() {
        User user = new User("a@example.com", "Alice", "Smith");
        when(userRepository.existsByEmail("a@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("a@example.com");
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldUpdateUser() {
        User existing = new User("old@example.com", "Old", "Name");
        User details = new User("new@example.com", "New", "Name");
        when(userRepository.findById(ID)).thenReturn(Optional.of(existing));
        when(userRepository.save(existing)).thenReturn(existing);

        Optional<User> result = userService.update(ID, details);

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("new@example.com");
        assertThat(result.get().getFirstName()).isEqualTo("New");
    }

    @Test
    void shouldReturnEmptyWhenUpdatingNonExistentUser() {
        when(userRepository.findById(MISSING_ID)).thenReturn(Optional.empty());

        assertThat(userService.update(MISSING_ID, new User("x@example.com", "X", "Y"))).isEmpty();
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldDeleteExistingUser() {
        when(userRepository.existsById(ID)).thenReturn(true);

        boolean result = userService.deleteById(ID);

        assertThat(result).isTrue();
        verify(userRepository).deleteById(ID);
    }

    @Test
    void shouldReturnFalseWhenDeletingNonExistentUser() {
        when(userRepository.existsById(MISSING_ID)).thenReturn(false);

        boolean result = userService.deleteById(MISSING_ID);

        assertThat(result).isFalse();
        verify(userRepository, never()).deleteById(any());
    }
}
