package dev.jasonsjones.hanger_api.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jdbc.test.autoconfigure.DataJdbcTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJdbcTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUserById() {
        User user = new User("alice@example.com", "Alice", "Smith");
        User saved = userRepository.save(user);

        assertThat(saved.getId()).isNotNull();
        Optional<User> found = userRepository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    void shouldFindByEmail() {
        userRepository.save(new User("bob@example.com", "Bob", "Jones"));

        Optional<User> found = userRepository.findByEmail("bob@example.com");
        assertThat(found).isPresent();
        assertThat(found.get().getFirstName()).isEqualTo("Bob");
    }

    @Test
    void shouldReturnEmptyWhenEmailNotFound() {
        Optional<User> found = userRepository.findByEmail("nobody@example.com");
        assertThat(found).isEmpty();
    }

    @Test
    void shouldDetectExistingEmail() {
        userRepository.save(new User("carol@example.com", "Carol", "White"));

        assertThat(userRepository.existsByEmail("carol@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("other@example.com")).isFalse();
    }

    @Test
    void shouldFindAllUsers() {
        userRepository.save(new User("dave@example.com", "Dave", "Brown"));
        userRepository.save(new User("eve@example.com", "Eve", "Davis"));

        List<User> all = userRepository.findAll();
        assertThat(all).hasSize(2);
    }

    @Test
    void shouldDeleteUser() {
        User saved = userRepository.save(new User("frank@example.com", "Frank", "Miller"));

        userRepository.deleteById(saved.getId());

        assertThat(userRepository.findById(saved.getId())).isEmpty();
    }
}
