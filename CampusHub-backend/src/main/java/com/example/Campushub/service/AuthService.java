package com.example.Campushub.service;

import com.example.Campushub.dto.LoginRequest;
import com.example.Campushub.dto.LoginResponse;
import com.example.Campushub.dto.RegisterRequest;
import com.example.Campushub.entity.Role;
import com.example.Campushub.entity.User;
import com.example.Campushub.repository.UserRepository;
import com.example.Campushub.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Public self-registration is Student-only. Admin/Faculty/Event Coordinator
    // accounts are created by an Admin (see UserController) or seeded at startup
    // (see DataSeeder) — never trust a role the client sent in this request,
    // or anyone could register themselves as an Admin.
    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists!";
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setDepartment(request.getDepartment());
        user.setEnabled(true);

        userRepository.save(user);

        return "User Registered Successfully";
    }

    // Login
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid Email"));

        if (!user.isEnabled()) {
            throw new RuntimeException("This account has been disabled. Contact your administrator.");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid Password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                "Login Successful",
                user.getName()
        );
    }

}