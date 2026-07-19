package com.example.Campushub.controller;

import com.example.Campushub.entity.Marks;
import com.example.Campushub.entity.Student;
import com.example.Campushub.repository.StudentRepository;
import com.example.Campushub.service.MarksService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin("*")
public class MarksController {

    private final MarksService service;
    private final StudentRepository studentRepository;

    public MarksController(MarksService service, StudentRepository studentRepository) {
        this.service = service;
        this.studentRepository = studentRepository;
    }

    @PostMapping
    public Marks addMarks(@RequestBody Marks marks) {
        return service.saveMarks(marks);
    }

    // Students only ever see their own marks rows, even via a direct API call —
    // mirrors the Marks page's frontend filtering but enforces it server-side too.
    @GetMapping
    public List<Marks> getAllMarks(Authentication authentication) {
        List<Marks> all = service.getAllMarks();
        if (isStudent(authentication)) {
            Student self = studentRepository.findByEmail(authentication.getName()).orElse(null);
            if (self == null || self.getRegisterNumber() == null) return Collections.emptyList();
            return all.stream()
                    .filter(m -> self.getRegisterNumber().equals(m.getRegisterNumber()))
                    .collect(Collectors.toList());
        }
        return all;
    }

    private boolean isStudent(Authentication authentication) {
        if (authentication == null) return false;
        for (GrantedAuthority ga : authentication.getAuthorities()) {
            if ("ROLE_STUDENT".equals(ga.getAuthority())) return true;
        }
        return false;
    }

    @GetMapping("/{id}")
    public Marks getMarks(@PathVariable Long id) {
        return service.getMarksById(id);
    }

    @PutMapping("/{id}")
    public Marks updateMarks(@PathVariable Long id,
                             @RequestBody Marks marks) {
        return service.updateMarks(id, marks);
    }

    @DeleteMapping("/{id}")
    public String deleteMarks(@PathVariable Long id) {
        service.deleteMarks(id);
        return "Marks Deleted Successfully";
    }
}
