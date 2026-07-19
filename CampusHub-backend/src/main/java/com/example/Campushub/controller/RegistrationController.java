package com.example.Campushub.controller;

import com.example.Campushub.entity.Registration;
import com.example.Campushub.service.RegistrationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin("*")
public class RegistrationController {

    private final RegistrationService service;

    public RegistrationController(RegistrationService service) {
        this.service = service;
    }

    @PostMapping
    public Registration register(@RequestBody Registration registration) {
        return service.saveRegistration(registration);
    }

    @GetMapping
    public List<Registration> getAll() {
        return service.getAllRegistrations();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteRegistration(id);
    }
}