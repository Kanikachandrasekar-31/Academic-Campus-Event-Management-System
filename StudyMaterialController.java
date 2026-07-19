package com.example.Campushub.controller;

import com.example.Campushub.entity.StudyMaterial;
import com.example.Campushub.service.StudyMaterialService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin("*")
public class StudyMaterialController {

    private final StudyMaterialService service;

    public StudyMaterialController(StudyMaterialService service) {
        this.service = service;
    }

    @PostMapping
    public StudyMaterial addMaterial(@RequestBody StudyMaterial material) {
        return service.saveStudyMaterial(material);
    }

    @GetMapping
    public List<StudyMaterial> getAllMaterials() {
        return service.getAllStudyMaterials();
    }

    @GetMapping("/{id}")
    public StudyMaterial getMaterial(@PathVariable Long id) {
        return service.getStudyMaterialById(id);
    }

    @PutMapping("/{id}")
    public StudyMaterial updateMaterial(@PathVariable Long id,
                                        @RequestBody StudyMaterial material) {
        return service.updateStudyMaterial(id, material);
    }

    @DeleteMapping("/{id}")
    public String deleteMaterial(@PathVariable Long id) {
        service.deleteStudyMaterial(id);
        return "Study Material Deleted Successfully";
    }
}