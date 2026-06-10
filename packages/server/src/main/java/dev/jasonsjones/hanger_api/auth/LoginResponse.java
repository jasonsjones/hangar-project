package dev.jasonsjones.hanger_api.auth;

import dev.jasonsjones.hanger_api.user.User;

import java.util.UUID;

public class LoginResponse {

    private final boolean success;
    private final UUID userId;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String token;

    public LoginResponse(boolean success, UUID userId, String email, String firstName, String lastName, String token) {
        this.success = success;
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.token = token;
    }

    public static LoginResponse fromUser(User user, String token) {
        return new LoginResponse(
                true,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                token
        );
    }

    public boolean isSuccess() { return success; }
    public UUID getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getToken() { return token; }
}
