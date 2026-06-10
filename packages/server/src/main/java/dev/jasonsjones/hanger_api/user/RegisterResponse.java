package dev.jasonsjones.hanger_api.user;

/**
 * Response for a successful registration: the newly created {@link User} plus a
 * freshly minted JWT so the caller is logged in immediately, without a separate
 * round-trip to {@code /api/auth/login}.
 *
 * <p>Kept distinct from {@link User} on purpose — the {@code GET /api/users} list
 * reuses the bare {@code User} shape, and we don't want a {@code token} field
 * leaking (as null) into every row of that listing.
 */
public class RegisterResponse {

    private final User user;
    private final String token;

    public RegisterResponse(User user, String token) {
        this.user = user;
        this.token = token;
    }

    public User getUser() { return user; }
    public String getToken() { return token; }
}
