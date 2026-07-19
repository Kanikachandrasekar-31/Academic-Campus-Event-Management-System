package com.example.Campushub.config;

import com.example.Campushub.security.CustomUserDetailsService;
import com.example.Campushub.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Real, server-side role enforcement — mirrors the same permission model
 * already built into the frontend (App.jsx routes / Sidebar.jsx nav), so
 * that hiding a button in the UI is backed up by an actual 403 if someone
 * calls the API directly (e.g. via Postman) without the right role.
 *
 * Roles: ADMIN, FACULTY, EVENT_COORDINATOR, STUDENT.
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter,
                          CustomUserDetailsService userDetailsService) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // Frontend (port 5173) and backend (port 8082) are different origins even
    // on localhost, and the app may be opened from any device's IP on the
    // network — so this deliberately allows any origin rather than a fixed
    // list. Without this wired into .cors() below, a browser's CORS preflight
    // (OPTIONS) request for any authenticated endpoint would itself get
    // evaluated against the authorization rules below and rejected (no
    // preflight carries an Authorization header), which surfaces to the
    // frontend as a generic "cannot reach the server" network error.
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public
                        .requestMatchers("/api/auth/**").permitAll()
                        // Google redirects here without a JWT — identity is carried in the
                        // one-time OAuth "state" param instead. See CalendarController.
                        .requestMatchers("/api/calendar/oauth2callback").permitAll()

                        // Self-service profile (name/department only) — any authenticated user
                        .requestMatchers("/api/profile/**").authenticated()

                        // Login/user account management — Admin only
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // Faculty directory — Admin only (matches the /faculty frontend route)
                        .requestMatchers("/api/faculty/**").hasRole("ADMIN")

                        // Student directory — Admin + Faculty manage; Students get read-only
                        // access too (Registration.jsx needs the list to populate its dropdown)
                        .requestMatchers(HttpMethod.GET, "/api/students/**").hasAnyRole("ADMIN", "FACULTY", "STUDENT")
                        .requestMatchers("/api/students/**").hasAnyRole("ADMIN", "FACULTY")

                        // Attendance — everyone can view, only Faculty/Admin record it
                        .requestMatchers(HttpMethod.GET, "/api/attendance/**").hasAnyRole("ADMIN", "FACULTY", "STUDENT")
                        .requestMatchers("/api/attendance/**").hasAnyRole("ADMIN", "FACULTY")

                        // Marks — everyone can view, only Faculty/Admin record it
                        .requestMatchers(HttpMethod.GET, "/api/marks/**").hasAnyRole("ADMIN", "FACULTY", "STUDENT")
                        .requestMatchers("/api/marks/**").hasAnyRole("ADMIN", "FACULTY")

                        // Assignments — everyone can view, only Faculty/Admin post them
                        .requestMatchers(HttpMethod.GET, "/api/assignments/**").hasAnyRole("ADMIN", "FACULTY", "STUDENT")
                        .requestMatchers("/api/assignments/**").hasAnyRole("ADMIN", "FACULTY")

                        // Study materials — everyone can view, only Faculty/Admin upload
                        .requestMatchers(HttpMethod.GET, "/api/materials/**").hasAnyRole("ADMIN", "FACULTY", "STUDENT")
                        .requestMatchers("/api/materials/**").hasAnyRole("ADMIN", "FACULTY")

                        // Events — Admin/Student/Coordinator can view, only Admin/Coordinator manage
                        .requestMatchers(HttpMethod.GET, "/api/events/**").hasAnyRole("ADMIN", "STUDENT", "EVENT_COORDINATOR")
                        .requestMatchers("/api/events/**").hasAnyRole("ADMIN", "EVENT_COORDINATOR")

                        // Venues — Admin + Coordinator only, both viewing and managing
                        .requestMatchers("/api/venues/**").hasAnyRole("ADMIN", "EVENT_COORDINATOR")

                        // Registrations — Admin/Student/Coordinator view & create (students register
                        // themselves); only Admin/Coordinator can remove a registration outright
                        .requestMatchers(HttpMethod.DELETE, "/api/registrations/**").hasAnyRole("ADMIN", "EVENT_COORDINATOR")
                        .requestMatchers("/api/registrations/**").hasAnyRole("ADMIN", "STUDENT", "EVENT_COORDINATOR")

                        // Clubs — Admin/Student/Coordinator view, Admin/Coordinator manage
                        .requestMatchers(HttpMethod.GET, "/api/clubs/**").hasAnyRole("ADMIN", "STUDENT", "EVENT_COORDINATOR")
                        .requestMatchers("/api/clubs/**").hasAnyRole("ADMIN", "EVENT_COORDINATOR")

                        // Announcements — everyone can read, only staff roles post them
                        .requestMatchers(HttpMethod.GET, "/api/announcements/**").authenticated()
                        .requestMatchers("/api/announcements/**").hasAnyRole("ADMIN", "FACULTY", "EVENT_COORDINATOR")

                        // File uploads (materials/posters) — staff roles only
                        .requestMatchers("/api/upload/**").hasAnyRole("ADMIN", "FACULTY", "EVENT_COORDINATOR")

                        // At-risk analytics — sensitive; Faculty/Admin only, never a student's peers
                        .requestMatchers("/api/analytics/**").hasAnyRole("ADMIN", "FACULTY")

                        // Class groups (faculty's per-class attendance/marks rosters) — Admin/Faculty only
                        .requestMatchers("/api/class-groups/**").hasAnyRole("ADMIN", "FACULTY")

                        // Dashboard, chatbot, calendar connect/status — any authenticated user
                        .requestMatchers("/api/dashboard/**").authenticated()
                        .requestMatchers("/api/chatbot/**").authenticated()
                        .requestMatchers("/api/calendar/**").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
