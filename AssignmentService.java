package com.example.Campushub.service;

import com.example.Campushub.entity.Assignment;
import com.example.Campushub.repository.AssignmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository repository;
    private final NotificationService notificationService;
    private final CalendarService calendarService;

    public AssignmentService(AssignmentRepository repository, NotificationService notificationService,
                              CalendarService calendarService) {
        this.repository = repository;
        this.notificationService = notificationService;
        this.calendarService = calendarService;
    }

    public Assignment saveAssignment(Assignment assignment) {
        Assignment saved = repository.save(assignment);
        notificationService.notifyAssignmentPosted(
                saved.getTitle(), saved.getSubject(), saved.getFacultyName(), saved.getDueDate(),
                saved.getTargetDepartment(), saved.getTargetYear(), saved.getTargetSection());
        calendarService.syncAssignmentToConnectedStudents(
                saved.getTitle(), saved.getSubject(), saved.getDueDate(),
                saved.getTargetDepartment(), saved.getTargetYear(), saved.getTargetSection());
        return saved;
    }

    public List<Assignment> getAllAssignments() {
        return repository.findAll();
    }

    public Assignment getAssignmentById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
    }

    public Assignment updateAssignment(Long id, Assignment assignment) {

        Assignment existing = getAssignmentById(id);

        existing.setTitle(assignment.getTitle());
        existing.setDescription(assignment.getDescription());
        existing.setSubject(assignment.getSubject());
        existing.setFacultyName(assignment.getFacultyName());
        existing.setDueDate(assignment.getDueDate());
        existing.setAttachmentUrl(assignment.getAttachmentUrl());
        existing.setTargetDepartment(assignment.getTargetDepartment());
        existing.setTargetYear(assignment.getTargetYear());
        existing.setTargetSection(assignment.getTargetSection());

        return repository.save(existing);
    }

    public void deleteAssignment(Long id) {
        repository.deleteById(id);
    }
}