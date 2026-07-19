package com.example.Campushub.service;

import com.example.Campushub.entity.Faculty;
import com.example.Campushub.repository.FacultyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacultyService {

    private final FacultyRepository repository;

    public FacultyService(FacultyRepository repository) {
        this.repository = repository;
    }

    public Faculty saveFaculty(Faculty faculty) {
        return repository.save(faculty);
    }

    public List<Faculty> getAllFaculty() {
        return repository.findAll();
    }

    public Faculty getFacultyById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
    }

    public Faculty updateFaculty(Long id, Faculty faculty) {

        Faculty existing = getFacultyById(id);

        existing.setName(faculty.getName());
        existing.setEmail(faculty.getEmail());
        existing.setDepartment(faculty.getDepartment());
        existing.setDesignation(faculty.getDesignation());
        existing.setPhone(faculty.getPhone());

        return repository.save(existing);
    }

    public void deleteFaculty(Long id) {
        repository.deleteById(id);
    }
}