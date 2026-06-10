package dev.jasonsjones.hanger_api.auth;

import dev.jasonsjones.hanger_api.security.JwtService;
import dev.jasonsjones.hanger_api.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    // Login now mints a token; SecurityConfig also wires the JWT filter (whose only
    // dependency is JwtService). Mocking JwtService covers both.
    @MockitoBean
    private JwtService jwtService;

    @Test
    @WithMockUser
    void shouldReturn200WithUserWhenCredentialsValid() throws Exception {
        User user = new User("ada@example.com", "Ada", "Lovelace");
        when(authService.authenticate(eq("ada@example.com"), eq("correcthorse")))
                .thenReturn(Optional.of(user));
        when(jwtService.issueToken(user)).thenReturn("issued.jwt.token");

        LoginRequest request = new LoginRequest("ada@example.com", "correcthorse");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.userId").value(user.getId().toString()))
                .andExpect(jsonPath("$.email").value("ada@example.com"))
                .andExpect(jsonPath("$.firstName").value("Ada"))
                .andExpect(jsonPath("$.lastName").value("Lovelace"))
                .andExpect(jsonPath("$.token").value("issued.jwt.token"));
    }

    @Test
    @WithMockUser
    void shouldReturn401WhenPasswordWrong() throws Exception {
        when(authService.authenticate(any(), any())).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("ada@example.com", "wrongpw");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void shouldReturn401WhenEmailUnknown() throws Exception {
        when(authService.authenticate(any(), any())).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("ghost@example.com", "anything");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void shouldReturn400WhenEmailBlank() throws Exception {
        LoginRequest request = new LoginRequest("", "correcthorse");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void shouldReturn400WhenEmailMalformed() throws Exception {
        LoginRequest request = new LoginRequest("not-an-email", "correcthorse");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void shouldReturn400WhenPasswordBlank() throws Exception {
        LoginRequest request = new LoginRequest("ada@example.com", "");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
