package com.example.Campushub.dto;

public class LoginResponse {

    private String token;
    private String email;
    private String role;
    private String message;
    private String name;

    public LoginResponse() {
    }

    public LoginResponse(String token, String email,
                         String role, String message, String name) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.message = message;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}