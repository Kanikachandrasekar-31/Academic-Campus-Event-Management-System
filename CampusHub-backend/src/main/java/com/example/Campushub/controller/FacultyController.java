package com.example.Campushub.controller;

import com.example.Campushub.entity.Faculty;
import com.example.Campushub.service.FacultyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin("*")
public class FacultyController {

    private final FacultyService service;

    public FacultyController(FacultyService service) {
        this.service = service;
    }

    @PostMapping
    public Faculty addFaculty(@RequestBody Faculty faculty) {
        return service.saveFaculty(faculty);
    }

    @GetMapping
    public List<Faculty> getAllFaculty() {
        return service.getAllFaculty();
    }

    @GetMapping("/{id}")
    public Faculty getFaculty(@PathVariable Long id) {
        return service.getFacultyById(id);
    }

    @PutMapping("/{id}")
    public Faculty updateFaculty(@PathVariable Long id,
                                 @RequestBody Faculty faculty) {
        return service.updateFaculty(id, faculty);
    }

    @DeleteMapping("/{id}")
    public String deleteFaculty(@PathVariable Long id) {
        service.deleteFaculty(id);
        return "Faculty Deleted Successfully";
    }
}