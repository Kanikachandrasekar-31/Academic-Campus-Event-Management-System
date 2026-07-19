package com.example.Campushub.service;

import com.example.Campushub.entity.User;
import com.example.Campushub.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User saveUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("A user with this email already exists");
        }
        // This endpoint is Admin-only (see SecurityConfig), so trusting the
        // client-supplied role here is fine — unlike public self-registration.
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (!user.isEnabled()) {
            user.setEnabled(true);
        }
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(Long id, User update) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existing.setName(update.getName());
        existing.setDepartment(update.getDepartment());
        existing.setRole(update.getRole());
        existing.setEnabled(update.isEnabled());
        // Password is optional on update — only touch it if a new one was provided,
        // so editing someone's role/department doesn't force a password reset.
        if (update.getPassword() != null && !update.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(update.getPassword()));
        }

        return userRepository.save(existing);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
