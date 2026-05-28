package dev.jasonsjones.hanger_api.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterUserRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Size(min = 8, max = 128)
    private String password;

    public RegisterUserRequest() {}

    public RegisterUserRequest(String email, String firstName, String lastName, String password) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
