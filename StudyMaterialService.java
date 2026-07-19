package com.example.Campushub.service;

import com.example.Campushub.entity.StudyMaterial;
import com.example.Campushub.repository.StudyMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudyMaterialService {

    private final StudyMaterialRepository repository;
    private final NotificationService notificationService;

    public StudyMaterialService(StudyMaterialRepository repository, NotificationService notificationService) {
        this.repository = repository;
        this.notificationService = notificationService;
    }

    public StudyMaterial saveStudyMaterial(StudyMaterial material) {
        StudyMaterial saved = repository.save(material);
        notificationService.notifyStudyMaterialUploaded(
                saved.getTitle(), saved.getSubject(), saved.getUploadedBy(),
                saved.getTargetDepartment(), saved.getTargetYear(), saved.getTargetSection());
        return saved;
    }

    public List<StudyMaterial> getAllStudyMaterials() {
        return repository.findAll();
    }

    public StudyMaterial getStudyMaterialById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Study Material not found"));
    }

    public StudyMaterial updateStudyMaterial(Long id, StudyMaterial material) {

        StudyMaterial existing = getStudyMaterialById(id);

        existing.setTitle(material.getTitle());
        existing.setSubject(material.getSubject());
        existing.setSemester(material.getSemester());
        existing.setUploadedBy(material.getUploadedBy());
        existing.setUploadDate(material.getUploadDate());
        existing.setAttachmentUrl(material.getAttachmentUrl());
        existing.setTargetDepartment(material.getTargetDepartment());
        existing.setTargetYear(material.getTargetYear());
        existing.setTargetSection(material.getTargetSection());

        return repository.save(existing);
    }

    public void deleteStudyMaterial(Long id) {
        repository.deleteById(id);
    }
}