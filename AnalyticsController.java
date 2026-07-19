package com.example.Campushub.controller;

import com.example.Campushub.dto.AtRiskStudent;
import com.example.Campushub.service.AnalyticsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/at-risk-students")
    public List<AtRiskStudent> atRiskStudents() {
        return analyticsService.getAtRiskStudents();
    }
}
