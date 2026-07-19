package com.example.Campushub.controller;

import com.example.Campushub.entity.User;
import com.example.Campushub.repository.UserRepository;
import com.example.Campushub.service.CalendarService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = "*")
public class CalendarController {

    private final CalendarService calendarService;
    private final UserRepository userRepository;

    public CalendarController(CalendarService calendarService, UserRepository userRepository) {
        this.calendarService = calendarService;
        this.userRepository = userRepository;
    }

    @GetMapping("/connect")
    public Map<String, Object> connect(Authentication authentication) {
        if (!calendarService.isConfigured()) {
            return Map.of("configured", false,
                    "message", "Google Calendar isn't configured on the server yet (google.oauth.client-id/secret are blank).");
        }
        String authUrl = calendarService.buildAuthUrl(authentication.getName());
        return Map.of("configured", true, "authUrl", authUrl);
    }

    // Google redirects the user's browser here directly (no Authorization header) —
    // identity comes from the "state" param we set to the user's email in buildAuthUrl().
    @GetMapping("/oauth2callback")
    public void callback(@RequestParam(required = false) String code,
                          @RequestParam(required = false) String state,
                          @RequestParam(required = false) String error,
                          HttpServletResponse response) throws IOException {
        String base = calendarService.getFrontendRedirectBase();
        if (error != null || code == null || state == null) {
            response.sendRedirect(base + "/settings?calendar=error");
            return;
        }
        try {
            String email = URLDecoder.decode(state, StandardCharsets.UTF_8);
            calendarService.handleOAuthCallback(code, email);
            response.sendRedirect(base + "/settings?calendar=connected");
        } catch (Exception e) {
            response.sendRedirect(base + "/settings?calendar=error");
        }
    }

    @GetMapping("/status")
    public Map<String, Object> status(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        return Map.of(
                "configured", calendarService.isConfigured(),
                "connected", calendarService.isConnected(user)
        );
    }

    @PostMapping("/disconnect")
    public Map<String, Object> disconnect(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user != null) {
            calendarService.disconnect(user);
        }
        return Map.of("connected", false);
    }
}
