package com.example.Campushub.service;

import com.example.Campushub.entity.Registration;
import com.example.Campushub.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationService {

    private final RegistrationRepository repository;

    public RegistrationService(RegistrationRepository repository) {
        this.repository = repository;
    }

    public Registration saveRegistration(Registration registration) {
        return repository.save(registration);
    }

    public List<Registration> getAllRegistrations() {
        return repository.findAll();
    }

    public Registration getRegistration(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteRegistration(Long id) {
        repository.deleteById(id);
    }
}