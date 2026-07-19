package com.example.Campushub.service;

import com.example.Campushub.entity.Role;
import com.example.Campushub.entity.Student;
import com.example.Campushub.entity.User;
import com.example.Campushub.repository.StudentRepository;
import com.example.Campushub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Google Calendar integration. Off by default: until google.oauth.client-id
 * and client-secret are set in application.properties, connect() reports
 * "not configured" and event sync is a silent no-op rather than an error.
 *
 * Each student connects their own Google account (OAuth authorization-code
 * flow) and grants the calendar.events scope; we then create events on
 * their primary calendar whenever a new Assignment or Event is posted.
 */
@Service
public class CalendarService {

    private static final Logger log = LoggerFactory.getLogger(CalendarService.class);
    private static final String AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String CALENDAR_EVENTS_ENDPOINT = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
    private static final String SCOPE = "https://www.googleapis.com/auth/calendar.events";

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final RestTemplate restTemplate;

    @Value("${google.oauth.client-id:}")
    private String clientId;

    @Value("${google.oauth.client-secret:}")
    private String clientSecret;

    @Value("${google.oauth.redirect-uri:http://localhost:8082/api/calendar/oauth2callback}")
    private String redirectUri;

    @Value("${google.oauth.frontend-redirect-base:http://localhost:5173}")
    private String frontendRedirectBase;

    public CalendarService(UserRepository userRepository, StudentRepository studentRepository, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.restTemplate = restTemplate;
    }

    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank();
    }

    public String getFrontendRedirectBase() {
        return frontendRedirectBase;
    }

    /** Builds the Google consent-screen URL. `state` carries the user's email so the callback can identify them. */
    public String buildAuthUrl(String userEmail) {
        String state = URLEncoder.encode(userEmail, StandardCharsets.UTF_8);
        return UriComponentsBuilder.fromHttpUrl(AUTH_ENDPOINT)
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", SCOPE)
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    /** Exchanges the authorization code Google sent back for access + refresh tokens, and saves them on the user. */
    public void handleOAuthCallback(String code, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            log.warn("Calendar OAuth callback for unknown user email: {}", userEmail);
            return;
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(TOKEN_ENDPOINT, request, Map.class);
        if (response == null) {
            log.warn("Empty response exchanging Google OAuth code for user {}", userEmail);
            return;
        }

        String accessToken = (String) response.get("access_token");
        String refreshToken = (String) response.get("refresh_token");
        Number expiresIn = (Number) response.get("expires_in");

        user.setGoogleAccessToken(accessToken);
        // Google only sends a refresh_token the FIRST time a user consents (or with prompt=consent,
        // which we always pass) — keep the old one if this response happens not to include it.
        if (refreshToken != null && !refreshToken.isBlank()) {
            user.setGoogleRefreshToken(refreshToken);
        }
        if (expiresIn != null) {
            user.setGoogleTokenExpiryEpochMs(Instant.now().toEpochMilli() + expiresIn.longValue() * 1000);
        }
        userRepository.save(user);
        log.info("Connected Google Calendar for {}", userEmail);
    }

    public boolean isConnected(User user) {
        return user != null && user.getGoogleRefreshToken() != null && !user.getGoogleRefreshToken().isBlank();
    }

    public void disconnect(User user) {
        user.setGoogleAccessToken(null);
        user.setGoogleRefreshToken(null);
        user.setGoogleTokenExpiryEpochMs(null);
        userRepository.save(user);
    }

    /** Returns a valid access token for this user, refreshing it first if it has expired. Null if unavailable. */
    private String getValidAccessToken(User user) {
        if (!isConnected(user)) return null;

        boolean expired = user.getGoogleTokenExpiryEpochMs() == null
                || Instant.now().toEpochMilli() > user.getGoogleTokenExpiryEpochMs() - 60_000;

        if (!expired) {
            return user.getGoogleAccessToken();
        }

        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("client_id", clientId);
            form.add("client_secret", clientSecret);
            form.add("refresh_token", user.getGoogleRefreshToken());
            form.add("grant_type", "refresh_token");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(TOKEN_ENDPOINT, request, Map.class);
            if (response == null) return null;

            String accessToken = (String) response.get("access_token");
            Number expiresIn = (Number) response.get("expires_in");

            user.setGoogleAccessToken(accessToken);
            if (expiresIn != null) {
                user.setGoogleTokenExpiryEpochMs(Instant.now().toEpochMilli() + expiresIn.longValue() * 1000);
            }
            userRepository.save(user);
            return accessToken;
        } catch (RestClientException e) {
            log.warn("Failed to refresh Google token for {}: {}", user.getEmail(), e.getMessage());
            return null;
        }
    }

    private void createEvent(User user, String summary, String description, String dateStr, String timeStr) {
        String accessToken = getValidAccessToken(user);
        if (accessToken == null) return;

        try {
            Map<String, Object> start;
            Map<String, Object> end;

            if (timeStr != null && !timeStr.isBlank() && dateStr != null && dateStr.matches("\\d{4}-\\d{2}-\\d{2}")) {
                String startDateTime = dateStr + "T" + normalizeTime(timeStr) + ":00";
                start = Map.of("dateTime", startDateTime);
                end = Map.of("dateTime", dateStr + "T" + addOneHour(normalizeTime(timeStr)) + ":00");
            } else if (dateStr != null && dateStr.matches("\\d{4}-\\d{2}-\\d{2}")) {
                start = Map.of("date", dateStr);
                end = Map.of("date", dateStr);
            } else {
                // Date isn't in a parseable format — skip rather than send a malformed event.
                log.info("Skipping calendar sync for '{}': unparseable date '{}'", summary, dateStr);
                return;
            }

            Map<String, Object> event = Map.of(
                    "summary", summary,
                    "description", description != null ? description : "",
                    "start", start,
                    "end", end
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(event, headers);

            restTemplate.postForObject(CALENDAR_EVENTS_ENDPOINT, request, Map.class);
        } catch (RestClientException e) {
            log.warn("Failed to create calendar event '{}' for {}: {}", summary, user.getEmail(), e.getMessage());
        }
    }

    private String normalizeTime(String t) {
        // Accepts "HH:mm" or "HH:mm:ss"; pads to at least HH:mm.
        return t.length() >= 5 ? t.substring(0, 5) : t;
    }

    private String addOneHour(String hhmm) {
        int h = Integer.parseInt(hhmm.substring(0, 2));
        String m = hhmm.substring(3, 5);
        h = (h + 1) % 24;
        return String.format("%02d:%s", h, m);
    }

    @Async
    public void syncAssignmentToConnectedStudents(String title, String subject, String dueDate,
                                                   String targetDepartment, String targetYear, String targetSection) {
        if (!isConfigured()) return;
        List<User> connected = userRepository.findByRoleAndGoogleRefreshTokenIsNotNull(Role.STUDENT);
        boolean scoped = isSet(targetDepartment) || isSet(targetYear) || isSet(targetSection);
        for (User u : connected) {
            if (scoped && !matchesTargetClass(u, targetDepartment, targetYear, targetSection)) continue;
            createEvent(u, "Assignment Due: " + title, "Subject: " + subject, dueDate, null);
        }
    }

    private boolean isSet(String v) {
        return v != null && !v.isBlank();
    }

    private boolean matchesTargetClass(User user, String targetDepartment, String targetYear, String targetSection) {
        Student student = studentRepository.findByEmail(user.getEmail()).orElse(null);
        if (student == null) return false;
        return fieldMatches(student.getDepartment(), targetDepartment)
                && fieldMatches(student.getYear(), targetYear)
                && fieldMatches(student.getSection(), targetSection);
    }

    private boolean fieldMatches(String studentValue, String targetValue) {
        if (!isSet(targetValue)) return true;
        return studentValue != null && studentValue.trim().equalsIgnoreCase(targetValue.trim());
    }

    @Async
    public void syncEventToConnectedStudents(String eventName, String eventDate, String eventTime, String venue) {
        if (!isConfigured()) return;
        List<User> connected = userRepository.findByRoleAndGoogleRefreshTokenIsNotNull(Role.STUDENT);
        for (User u : connected) {
            createEvent(u, eventName, venue != null ? "Venue: " + venue : null, eventDate, eventTime);
        }
    }
}
