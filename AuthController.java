package com.example.Campushub.controller;

import com.example.Campushub.dto.LoginRequest;
import com.example.Campushub.dto.LoginResponse;
import com.example.Campushub.dto.RegisterRequest;
import com.example.Campushub.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        String result = authService.register(request);
        if (result.toLowerCase().contains("already exists")) {
            return ResponseEntity.status(409).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            // Deliberately 400, not 401: the frontend treats 401 as "your
            // existing session expired" and clears the stored token — which
            // would be wrong here and could wipe out a *different*, still-valid
            // session if someone mistypes credentials while already logged in
            // elsewhere in the same browser tab.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}