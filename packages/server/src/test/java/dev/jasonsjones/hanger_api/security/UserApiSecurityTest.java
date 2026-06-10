package dev.jasonsjones.hanger_api.security;

import dev.jasonsjones.hanger_api.user.User;
import dev.jasonsjones.hanger_api.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end check of the authorization rules in {@code SecurityConfig}, exercising
 * the real {@link JwtAuthenticationFilter} and {@link JwtService} (no {@code @WithMockUser}
 * shortcut). This is the test that actually proves the requirement: the user list is
 * locked behind a valid bearer token, while registration stays open.
 *
 * <p>{@code UserService} is mocked so we don't depend on seeded data — the point here
 * is the security layer, not persistence.
 */
@SpringBootTest
@AutoConfigureMockMvc
class UserApiSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private UserService userService;

    @Test
    void shouldReject401WhenListingUsersWithoutToken() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReject401WhenTokenIsGarbage() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer not.a.real.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAllowListingUsersWithValidToken() throws Exception {
        User user = new User("ada@example.com", "Ada", "Lovelace");
        when(userService.findAll()).thenReturn(List.of(user));
        String token = jwtService.issueToken(user);

        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowRegistrationWithoutToken() throws Exception {
        User created = new User("new@example.com", "New", "User");
        when(userService.register(any())).thenReturn(created);

        String body = objectMapper.writeValueAsString(
                java.util.Map.of(
                        "email", "new@example.com",
                        "firstName", "New",
                        "lastName", "User",
                        "password", "secretpw1"));

        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }

    @Test
    void shouldReject401WhenDeletingUserWithoutToken() throws Exception {
        mockMvc.perform(delete("/api/users/00000000-0000-0000-0000-000000000001")
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}
