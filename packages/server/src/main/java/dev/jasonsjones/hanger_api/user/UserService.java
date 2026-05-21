package dev.jasonsjones.hanger_api.user;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    public User create(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + user.getEmail());
        }
        return userRepository.save(user);
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
