package dev.jasonsjones.hanger_api.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Reads a {@code Authorization: Bearer <token>} header, validates it, and — on
 * success — places an authenticated principal in the {@link SecurityContextHolder}
 * for the rest of the request.
 *
 * <p>Deliberately does NOT reject anything itself. If the header is absent or the
 * token is bad, it simply leaves the context unauthenticated and continues the
 * chain; the authorization rules in {@code SecurityConfig} then decide whether the
 * target endpoint needed authentication (401) or not (public route still works).
 * Keeping the "is this allowed?" decision in one place — the filter chain config —
 * is what keeps the security model easy to reason about.
 *
 * <p>Extends {@link OncePerRequestFilter} so it runs exactly once per request even
 * when the container dispatches internally (forwards, error pages, async).
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            String token = header.substring(BEARER_PREFIX.length());
            try {
                UUID userId = jwtService.parseUserId(token);
                // No roles yet — every authenticated user is equal for now. An empty
                // authority list still yields an authenticated token, which is all the
                // ".authenticated()" rules require.
                var authentication = new UsernamePasswordAuthenticationToken(
                        userId, null, List.of());
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException | IllegalArgumentException ex) {
                // Malformed, tampered, or expired token — leave the context anonymous
                // and let the authorization layer return 401 for protected routes.
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
