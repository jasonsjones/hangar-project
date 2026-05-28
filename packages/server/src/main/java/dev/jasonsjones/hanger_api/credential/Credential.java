package dev.jasonsjones.hanger_api.credential;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("credentials")
public class Credential implements Persistable<UUID> {

    @Id
    private UUID id;

    private UUID userId;

    @NotBlank
    private String provider;

    private String secret;

    private String providerUid;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Transient
    private boolean isNew;

    public Credential() {}

    public static Credential password(UUID userId, String hashedSecret) {
        Credential c = new Credential();
        c.id = UUID.randomUUID();
        c.userId = userId;
        c.provider = "password";
        c.secret = hashedSecret;
        c.providerUid = null;
        LocalDateTime now = LocalDateTime.now();
        c.createdAt = now;
        c.updatedAt = now;
        c.isNew = true;
        return c;
    }

    @Override
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    @Override
    public boolean isNew() { return isNew; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getSecret() { return secret; }
    public void setSecret(String secret) {
        this.secret = secret;
        this.updatedAt = LocalDateTime.now();
    }

    public String getProviderUid() { return providerUid; }
    public void setProviderUid(String providerUid) { this.providerUid = providerUid; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
