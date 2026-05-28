package dev.jasonsjones.hanger_api.user;

import dev.jasonsjones.hanger_api.credential.PasswordService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordService passwordService;

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
    void shouldRegisterUserWithoutPassword() {
        RegisterUserRequest request = new RegisterUserRequest("a@example.com", "Alice", "Smith", null);
        when(userRepository.existsByEmail("a@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User created = userService.register(request);

        assertThat(created.getEmail()).isEqualTo("a@example.com");
        verify(passwordService, never()).setPassword(any(), any());
    }

    @Test
    void shouldRegisterUserWithPassword() {
        RegisterUserRequest request = new RegisterUserRequest("a@example.com", "Alice", "Smith", "secretpw1");
        when(userRepository.existsByEmail("a@example.com")).thenReturn(false);
        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(savedUser.capture())).thenAnswer(inv -> inv.getArgument(0));

        User created = userService.register(request);

        assertThat(created.getEmail()).isEqualTo("a@example.com");
        verify(passwordService).setPassword(eq(savedUser.getValue().getId()), eq("secretpw1"));
    }

    @Test
    void shouldSkipPasswordWhenBlank() {
        RegisterUserRequest request = new RegisterUserRequest("a@example.com", "Alice", "Smith", "   ");
        when(userRepository.existsByEmail("a@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.register(request);

        verify(passwordService, never()).setPassword(any(), any());
    }

    @Test
    void shouldThrowWhenEmailAlreadyExists() {
        RegisterUserRequest request = new RegisterUserRequest("a@example.com", "Alice", "Smith", "secretpw1");
        when(userRepository.existsByEmail("a@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("a@example.com");
        verify(userRepository, never()).save(any());
        verify(passwordService, never()).setPassword(any(), any());
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
