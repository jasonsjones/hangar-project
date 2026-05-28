package dev.jasonsjones.hanger_api.credential;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordService {

    private static final String PROVIDER = "password";

    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordService(CredentialRepository credentialRepository, PasswordEncoder passwordEncoder) {
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void setPassword(UUID userId, String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Password must not be blank");
        }
        String hash = passwordEncoder.encode(rawPassword);
        credentialRepository.findByUserIdAndProvider(userId, PROVIDER)
                .map(existing -> {
                    existing.setSecret(hash);
                    return credentialRepository.save(existing);
                })
                .orElseGet(() -> credentialRepository.save(Credential.password(userId, hash)));
    }

    public boolean verifyPassword(UUID userId, String rawPassword) {
        if (rawPassword == null) {
            return false;
        }
        return credentialRepository.findByUserIdAndProvider(userId, PROVIDER)
                .map(credential -> passwordEncoder.matches(rawPassword, credential.getSecret()))
                .orElse(false);
    }
}
