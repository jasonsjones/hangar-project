package dev.jasonsjones.hanger_api.user;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    private static final UUID ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID MISSING_ID = UUID.fromString("00000000-0000-0000-0000-000000000099");

    @Test
    @WithMockUser
    void shouldReturnAllUsers() throws Exception {
        when(userService.findAll()).thenReturn(List.of(
                new User("a@example.com", "Alice", "Smith")
        ));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].email").value("a@example.com"));
    }

    @Test
    @WithMockUser
    void shouldReturnUserById() throws Exception {
        User user = new User("a@example.com", "Alice", "Smith");
        when(userService.findById(ID)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/users/" + ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("a@example.com"));
    }

    @Test
    @WithMockUser
    void shouldReturn404WhenUserNotFound() throws Exception {
        when(userService.findById(MISSING_ID)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/" + MISSING_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void shouldCreateUser() throws Exception {
        User user = new User("a@example.com", "Alice", "Smith");
        when(userService.create(any(User.class))).thenReturn(user);

        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("a@example.com"));
    }

    @Test
    @WithMockUser
    void shouldReturn400WhenCreatingUserWithInvalidData() throws Exception {
        User invalid = new User("not-an-email", "", "Smith");

        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void shouldUpdateUser() throws Exception {
        User updated = new User("new@example.com", "New", "Name");
        when(userService.update(eq(ID), any(User.class))).thenReturn(Optional.of(updated));

        mockMvc.perform(put("/api/users/" + ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@example.com"));
    }

    @Test
    @WithMockUser
    void shouldReturn404WhenUpdatingNonExistentUser() throws Exception {
        when(userService.update(eq(MISSING_ID), any(User.class))).thenReturn(Optional.empty());
        User user = new User("a@example.com", "Alice", "Smith");

        mockMvc.perform(put("/api/users/" + MISSING_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void shouldDeleteUser() throws Exception {
        when(userService.deleteById(ID)).thenReturn(true);

        mockMvc.perform(delete("/api/users/" + ID).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void shouldReturn404WhenDeletingNonExistentUser() throws Exception {
        when(userService.deleteById(MISSING_ID)).thenReturn(false);

        mockMvc.perform(delete("/api/users/" + MISSING_ID).with(csrf()))
                .andExpect(status().isNotFound());
    }
}
