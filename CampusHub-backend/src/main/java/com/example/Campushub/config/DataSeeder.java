package com.example.Campushub.config;

import com.example.Campushub.entity.Role;
import com.example.Campushub.entity.User;
import com.example.Campushub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Since public self-registration is Student-only (see AuthService), the
 * Admin/Faculty/Event Coordinator accounts have to come from somewhere.
 * This seeds one starter account per staff role on first startup — an Admin
 * can create more from the Users page once logged in. Runs every startup,
 * but each check is "does this email already exist" so it's a no-op after
 * the first run, and never touches an account that's already there (so an
 * admin changing their own password later won't get overwritten back).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        userRepository.fixLegacyNullEnabledFlags();

        seed("Admin", "admin@gmail.com", "ADMIN", Role.ADMIN);
        seed("Teacher", "teacher@gmail.com", "TEACHER", Role.FACULTY);
        seed("Event Coordinator", "event@gmail.com", "EVENT", Role.EVENT_COORDINATOR);
    }

    private void seed(String name, String email, String rawPassword, Role role) {
        if (userRepository.existsByEmail(email)) return;

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEnabled(true);
        userRepository.save(user);

        log.info("Seeded default {} account: {}", role, email);
    }
}
