package com.example.Campushub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password is required")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String department;

    private boolean enabled = true;

    // Google Calendar OAuth (populated once the user connects their account —
    // see CalendarService/CalendarController). Null/blank means not connected.
    @Column(length = 2048)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String googleAccessToken;

    @Column(length = 512)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String googleRefreshToken;

    private Long googleTokenExpiryEpochMs;

    public User() {
    }

    public User(Long id, String name, String email, String password,
                Role role, String department, boolean enabled) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.enabled = enabled;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getGoogleAccessToken() {
        return googleAccessToken;
    }

    public void setGoogleAccessToken(String googleAccessToken) {
        this.googleAccessToken = googleAccessToken;
    }

    public String getGoogleRefreshToken() {
        return googleRefreshToken;
    }

    public void setGoogleRefreshToken(String googleRefreshToken) {
        this.googleRefreshToken = googleRefreshToken;
    }

    public Long getGoogleTokenExpiryEpochMs() {
        return googleTokenExpiryEpochMs;
    }

    public void setGoogleTokenExpiryEpochMs(Long googleTokenExpiryEpochMs) {
        this.googleTokenExpiryEpochMs = googleTokenExpiryEpochMs;
    }
}