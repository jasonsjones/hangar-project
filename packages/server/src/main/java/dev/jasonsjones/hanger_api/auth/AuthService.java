package dev.jasonsjones.hanger_api.auth;

import dev.jasonsjones.hanger_api.credential.PasswordService;
import dev.jasonsjones.hanger_api.user.User;
import dev.jasonsjones.hanger_api.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;

    public AuthService(UserRepository userRepository, PasswordService passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }

    public Optional<User> authenticate(String email, String rawPassword) {
        return userRepository.findByEmail(email)
                .filter(user -> passwordService.verifyPassword(user.getId(), rawPassword));
    }
}
