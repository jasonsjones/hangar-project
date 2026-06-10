package dev.jasonsjones.hanger_api;

import dev.jasonsjones.hanger_api.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // Stateless: we never create or rely on an HTTP session. Identity comes
                // from the bearer token on each request, so there's no session to fix.
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/status").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        // Registration must stay open — you can't have a token before
                        // you have an account. This POST-specific permit MUST come
                        // before the "/api/users/**" rule below, because the first
                        // matching rule wins.
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                        .requestMatchers("/api/users/**").authenticated()
                        .anyRequest().authenticated()
                )
                // For a token API, a missing/invalid credential is "you need to
                // authenticate" (401), not "you're forbidden" (403). Spring's default
                // for an anonymous request to a protected route is 403, so we install
                // an entry point that returns a bare 401 instead.
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                // Run our JWT filter before the username/password filter so the
                // SecurityContext is populated by the time authorization runs.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder(
            @Value("${security.password.bcrypt-cost:10}") int bcryptCost) {
        return new BCryptPasswordEncoder(bcryptCost);
    }
}
