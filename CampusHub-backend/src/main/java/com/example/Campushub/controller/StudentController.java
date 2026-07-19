package com.example.Campushub.controller;

import com.example.Campushub.entity.Student;
import com.example.Campushub.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService service;

    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return service.saveStudent(student);
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return service.getAllStudents();
    }

    // Lets a logged-in student find their own record (by matching account email)
    // so the frontend can filter assignments/materials down to their own class.
    @GetMapping("/me")
    public Student getMyStudentRecord(Authentication authentication) {
        return service.getAllStudents().stream()
                .filter(s -> s.getEmail() != null && s.getEmail().equalsIgnoreCase(authentication.getName()))
                .findFirst()
                .orElse(null);
    }
}