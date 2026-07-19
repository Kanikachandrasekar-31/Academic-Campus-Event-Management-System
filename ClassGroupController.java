package com.example.Campushub.controller;

import com.example.Campushub.entity.ClassGroup;
import com.example.Campushub.service.ClassGroupService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/class-groups")
@CrossOrigin(origins = "*")
public class ClassGroupController {

    private final ClassGroupService service;

    public ClassGroupController(ClassGroupService service) {
        this.service = service;
    }

    @GetMapping
    public List<ClassGroup> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ClassGroup create(@RequestBody ClassGroup group, Authentication authentication) {
        group.setCreatedBy(authentication != null ? authentication.getName() : null);
        return service.create(group);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
