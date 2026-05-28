package dev.jasonsjones.hanger_api.user;

import dev.jasonsjones.hanger_api.credential.PasswordService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;

    public UserService(UserRepository userRepository, PasswordService passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User register(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }
        User saved = userRepository.save(new User(
                request.getEmail(),
                request.getFirstName(),
                request.getLastName()
        ));
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            passwordService.setPassword(saved.getId(), request.getPassword());
        }
        return saved;
    }

    public Optional<User> update(UUID id, User userDetails) {
        return userRepository.findById(id).map(existing -> {
            existing.setFirstName(userDetails.getFirstName());
            existing.setLastName(userDetails.getLastName());
            existing.setEmail(userDetails.getEmail());
            return userRepository.save(existing);
        });
    }

    public boolean deleteById(UUID id) {
        if (!userRepository.existsById(id)) {
            return false;
        }
        userRepository.deleteById(id);
        return true;
    }
}
