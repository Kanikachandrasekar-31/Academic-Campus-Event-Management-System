package com.example.Campushub.controller;

import com.example.Campushub.entity.User;
import com.example.Campushub.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    private final UserRepository userRepository;

    public ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toMap(user);
    }

    // Deliberately narrow: only name + department are editable here.
    // Email, role, and password changes are out of scope for self-service
    // to avoid a student accidentally locking themselves out or escalating role.
    @PutMapping("/me")
    public Map<String, Object> updateMe(@RequestBody Map<String, String> body, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (body.containsKey("name") && body.get("name") != null && !body.get("name").isBlank()) {
            user.setName(body.get("name"));
        }
        if (body.containsKey("department")) {
            user.setDepartment(body.get("department"));
        }

        userRepository.save(user);
        return toMap(user);
    }

    private Map<String, Object> toMap(User user) {
        return Map.of(
                "name", user.getName() != null ? user.getName() : "",
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "department", user.getDepartment() != null ? user.getDepartment() : ""
        );
    }
}
