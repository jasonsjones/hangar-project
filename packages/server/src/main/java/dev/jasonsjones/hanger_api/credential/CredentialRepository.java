package dev.jasonsjones.hanger_api.credential;

import org.springframework.data.repository.ListCrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface CredentialRepository extends ListCrudRepository<Credential, UUID> {

    Optional<Credential> findByUserIdAndProvider(UUID userId, String provider);

    boolean existsByUserIdAndProvider(UUID userId, String provider);
}
