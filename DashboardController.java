package com.example.Campushub.controller;

import com.example.Campushub.dto.DashboardResponse;
import com.example.Campushub.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping
    public DashboardResponse dashboard() {
        return service.getDashboard();
    }

    @GetMapping("/students")
    public long students() {
        return service.getStudentCount();
    }

    @GetMapping("/events")
    public long events() {
        return service.getEventCount();
    }

    @GetMapping("/registrations")
    public long registrations() {
        return service.getRegistrationCount();
    }

    @GetMapping("/venues")
    public long venues() {
        return service.getVenueCount();
    }
}