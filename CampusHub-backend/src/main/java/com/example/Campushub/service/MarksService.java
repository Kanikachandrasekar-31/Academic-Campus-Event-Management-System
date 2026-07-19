package com.example.Campushub.service;

import com.example.Campushub.entity.Marks;
import com.example.Campushub.repository.MarksRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarksService {

    private final MarksRepository repository;

    public MarksService(MarksRepository repository) {
        this.repository = repository;
    }

    public Marks saveMarks(Marks marks) {
        return repository.save(marks);
    }

    public List<Marks> getAllMarks() {
        return repository.findAll();
    }

    public Marks getMarksById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marks not found"));
    }

    public Marks updateMarks(Long id, Marks marks) {

        Marks existing = getMarksById(id);

        existing.setStudentName(marks.getStudentName());
        existing.setRegisterNumber(marks.getRegisterNumber());
        existing.setSubject(marks.getSubject());
        existing.setInternal1(marks.getInternal1());
        existing.setInternal2(marks.getInternal2());
        existing.setAssignment(marks.getAssignment());

        return repository.save(existing);
    }

    public void deleteMarks(Long id) {
        repository.deleteById(id);
    }
}